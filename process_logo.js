const Jimp = require('jimp');

async function processLogo() {
  try {
    const image = await Jimp.read('public/logo.png');
    console.log('Original image dimensions:', image.bitmap.width, 'x', image.bitmap.height);
    
    // Resize if it's too big (to help with layout symmetry and file size)
    if (image.bitmap.height > 100) {
      image.resize(Jimp.AUTO, 60); // resize height to 60px, auto width
      console.log('Resized to height 60px');
    }
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      const alpha = this.bitmap.data[idx + 3];
      
      // If it's a white-ish pixel, make it transparent
      if (red > 240 && green > 240 && blue > 240) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
      } 
      // If it's a very dark pixel (the text "Visibility"), make it white so it shows on dark background
      else if (red < 50 && green < 50 && blue < 50 && alpha > 100) {
        this.bitmap.data[idx + 0] = 255;
        this.bitmap.data[idx + 1] = 255;
        this.bitmap.data[idx + 2] = 255;
      }
    });
    
    await image.writeAsync('public/logo_processed.png');
    console.log('Logo processed successfully and saved as public/logo.png');
  } catch (err) {
    console.error('Error processing image:', err);
  }
}

processLogo();
