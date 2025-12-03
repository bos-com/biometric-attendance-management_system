
import { embedImage } from "./embedImage.js";
import fs from 'fs';
const {start} = embedImage();

const image = 'E:/GITHUB/BIOMETRIC-ATTENDENCE-MANAGEMENT-SYSTEM/bio-attendance/public/image.jpg' 
const imageData = fs.readFileSync(image);
const testEmbedding = async () => {
        const res = await start(imageData);
        console.log(res);
}
testEmbedding();