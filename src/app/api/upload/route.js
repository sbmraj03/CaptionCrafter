import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import uniqid from 'uniqid'

export async function POST(req){
     const formData = await req.formData()
     const file = formData.get('file');
     const {name,type} = file;

     const data = await file.arrayBuffer();
     
     const s3client = new S3Client({
          region: 'ap-south-1',
          credentials:{
               accessKeyId: process.env.dkvg77_AWS_ACCESS_KEY,
               secretAccessKey: process.env.dkvg77_AWS_SECRET_ACCESS_KEY,
          }
     })

     const id = uniqid();
     const ext = name.split('.').slice(-1);
     const newName = id + '.' + ext;
     
     const uploadCommand = new PutObjectCommand({
          Bucket: process.env.dkvg77_AWS_BUCKET,
          Body: data,
          ACL: 'public-read',
          ContentType: type,
          Key: newName,
     })

     await s3client.send(uploadCommand)
     return Response.json({name,ext,newName, id});
}