'use server';

import {date, z} from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';


const FormDataSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: '请选择客户',
  }),
  amount:z.coerce.number().gt(0,{message:'金额必须大于 0'}),
  status:z.enum(['pending','paid'],{
    invalid_type_error: '状态只能是 pending 或 paid',
  }),
  date:z.string(),
})

const CreateInvoice = FormDataSchema.omit({id:true,date:true})

export type State = {
  errors?:{
    customerId?:string[],
    amount?:string[],
    status?:string[],
  };
  message?:string | null;
}

export async function createInvoice(prevState:State,formData:FormData) {
  //const rawFormData = Object.fromEntries(formData);
  // const rawFormData= {
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // };
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if(!validatedFields.success){
    console.log(validatedFields);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Form: Failed to validate form data',
    };
  }

  const {customerId,amount,status} = validatedFields.data;

  //金额换算成分
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  try {
    await sql`INSERT INTO invoices (customer_id, amount, status, date) 
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
  }catch(error){
    //可以返回对应的数据库错误,或者业务错误
    return {
      message: 'Database: Failed to create invoice',
    }
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

const UpdateInvoice = FormDataSchema.omit({id:true,date:true})
export async function updateInvoice(id:string, formData:FormData) {
  const {customerId,amount,status} = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  try{
    await sql`UPDATE invoices SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status} 
    WHERE id = ${id}`;
  }catch(error){
    return {
      message: 'Database: Failed to update invoice',
    }
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id:string) {
  try{
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  }catch(error){
    return {
      message: 'Database: Failed to delete invoice',
    }
  }
}

export async function auth(
  prevState:string|undefined,
  formData:FormData
){
  try{
    await signIn('credentials',formData);
  }catch(error){
    if(error instanceof AuthError){
      switch(error.type){
        case 'CredentialsSignin':
          return '非法证书';
        default:  
          return '未知错误';
      }
    }
    throw error;
  }

}