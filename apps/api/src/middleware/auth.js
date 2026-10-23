import crypto from 'node:crypto';import {prisma} from '../db.js';import {appendAudit} from '../services/audit.js';
const COOKIE='csv_session';
const LOOPBACK_HOSTS=new Set(['localhost','127.0.0.1','[::1]']);
export function isAllowedOrigin(origin, req){
 if(typeof origin!=='string'||!origin)return false;
 const configured=(process.env.WEB_ORIGIN||'').split(',').map(value=>value.trim()).filter(Boolean);
 if(configured.includes(origin))return true;
 if(req){
  const host=req.get('x-forwarded-host')||req.get('host');
  const forwardedProto=req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol=forwardedProto|| (process.env.NODE_ENV==='development'?'http':'https');
  if(host){try{if(new URL(origin).origin===`${protocol}://${host}`)return true}catch{}}
 }
 if(process.env.NODE_ENV!=='development')return false;
 try{
  const request=new URL(origin);
  return configured.some(value=>{
   const expected=new URL(value);
   return request.protocol===expected.protocol&&request.port===expected.port&&LOOPBACK_HOSTS.has(request.hostname)&&LOOPBACK_HOSTS.has(expected.hostname);
  });
 }catch{return false}
}
export function hashToken(token){return crypto.createHash('sha256').update(token).digest('hex')}
export async function requireAuth(req,res,next){try{const token=req.cookies?.[COOKIE];if(!token)return res.status(401).json({error:{code:'UNAUTHENTICATED',message:'Sign in required.'}});const session=await prisma.session.findUnique({where:{tokenHash:hashToken(token)},include:{user:true}});if(!session||session.revokedAt||session.expiresAt<=new Date()||session.user.disabledAt)return res.status(401).json({error:{code:'SESSION_EXPIRED',message:'Session is invalid or expired.'}});req.user=session.user;req.sessionId=session.id;next()}catch(e){next(e)}}
export function requireRole(...roles){return(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({error:{code:'FORBIDDEN',message:'Insufficient role.'}})}
export function requireCsrf(req,res,next){if(['GET','HEAD','OPTIONS'].includes(req.method))return next();const origin=req.get('origin');if(!isAllowedOrigin(origin,req)){const host=req.get('x-forwarded-host')||req.get('host');const proto=req.get('x-forwarded-proto')?.split(',')[0]?.trim()||'https';const appAddress=(process.env.WEB_ORIGIN||`${proto}://${host||'localhost:3000'}`).split(',')[0].trim();console.warn('csrf_rejected',{reason:'origin',origin:origin||null,expectedOrigin:appAddress});return res.status(403).json({error:{code:'CSRF_ORIGIN_REJECTED',message:`This app address is not allowed. Open Aegis Vault at ${appAddress} and try again.`}})}const token=req.cookies?.csv_csrf,header=req.get('x-csrf-token'),tokensMatch=!!token&&!!header&&token.length===header.length&&crypto.timingSafeEqual(Buffer.from(token),Buffer.from(header));if(!tokensMatch){console.warn('csrf_rejected',{reason:'token',hasCookie:!!token,hasHeader:!!header});return res.status(403).json({error:{code:'CSRF_TOKEN_REJECTED',message:'The security token expired or became out of sync. Reload the workspace and try again.'}})}next()}
export async function canAccessProject(user,projectId,write=false){const project=await prisma.project.findFirst({where:{id:projectId,organizationId:user.organizationId},select:{id:true}});if(!project)return false;if(['ADMINISTRATOR','SECURITY_MANAGER'].includes(user.role))return true;const membership=await prisma.projectMember.findUnique({where:{projectId_userId:{projectId,userId:user.id}}});return!!membership&&(!write||user.role!=='VIEWER'&&['ADMINISTRATOR','SECURITY_MANAGER','DEVELOPER'].includes(membership.role))}
export{COOKIE};

