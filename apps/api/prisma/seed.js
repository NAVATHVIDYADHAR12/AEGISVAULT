import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../.env') });
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
const p = new PrismaClient();
try {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase(); const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error('Set SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least 12 characters in .env.');
  const existing = await p.user.findFirst({where:{email}}); if(existing) throw new Error('Seed administrator already exists; refusing to overwrite.');
  const hash=await argon2.hash(password,{type:argon2.argon2id});
  const org=await p.organization.create({data:{name:'Centralized Secret Vault',users:{create:{email,passwordHash:hash,role:'ADMINISTRATOR'}}}});
  console.log(`Created local administrator ${email} in organization ${org.name}.`);
} finally { await p.$disconnect(); }



