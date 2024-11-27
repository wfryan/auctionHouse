import AWS from 'aws-sdk'
const s3 = new AWS.S3();

export const handler = async (event) => {

    try {
        //let body = JSON.parse(event.body)
        const fileContent = Buffer.from(event.fileContent, 'base64'); // Decode the Base64 string
        const fileName = event.fileName; // Use the provided name or generate a unique one
        const fileExtension = event.fileType === 'png' ? 'png' : 'jpg'; // Default to jpg if not provided
        const contentType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
        const bucketName = process.env.BUCKET_NAME
        const params = {
            Bucket: bucketName,
            Key: `images/${fileName}`, // Specify the desired file name and path
            Body: fileContent,
            ContentEncoding: 'base64',
            ContentType: contentType // Adjust the content type as needed
        };


        const data = await s3.putObject(params).promise();
        const fileUrl = `https://${bucketName}.s3.amazonaws.com/images/${fileName}`;
        return {
            statusCode: 200,
            body: {
                message: "Image upload successful",
                fileUrl
            }
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error uploading image', error: err })
        };
    }
};