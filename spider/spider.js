// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   spider.js                                          :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: ivanderw <marvin@42.fr>                    +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2023/09/25 11:00:46 by ivanderw          #+#    #+#             //
//   Updated: 2023/09/25 13:03:00 by ivanderw         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //
/*
Create the Main Script: Create a JavaScript file (e.g., spider.js) to write your spider
program.

Import Dependencies: Import the required libraries at the top of your script.

Define CLI Options: Use commander to define the CLI options -r, -l, and -p. Parse these
options using the process.argv array.
Recursive Image Extraction:

● Use axios to make an HTTP request to the provided URL.

● Use cheerio to parse the HTML content and extract image URLs with the
specified extensions (jpg, jpeg, png, gif, bmp).

● Download the images using axios and save them to the specified path (or default
path).
Implement Recursion:

● If the -r option is specified, implement recursion to follow links and extract images
from linked pages.

● Use the -l option to limit the recursion depth.
*/
/*
const axios = require('axios');     
const cheerio = require('cheerio'); 
const fs = require('fs');       
const path = require('path');       
const program = require('commander');
const exifParser = require('exif-parser');
const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];


//command line options for program.
program
	.arguments('<url>')
	.option('-r, --recursive', 'Recursively downloads the images in a URL received as a parameter')
	.option('-l, --limit <number>', 'Indicates the maximum depth level of the recursive download', 5)
	.option('-p, --path <path>', 'Indicates the path where the downloaded files will be saved', './data/')
	.parse(process.argv)
	.action((url) => { 	console.log('URL:', url); } );
*/

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const program = require('commander');
const exifParser = require('exif-parser');
const urlLib = require('url');
const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];

program
    .version('1.0.0')
    .arguments('<url>')
    .option('-r, --recursive', 'Recursively download images')
    .option('-l, --level <n>', 'Depth level for recursive download', parseInt, 5)
    .option('-p, --path <path>', 'Path for downloaded files', './data/')
    .action(main)
    .parse(process.argv);

async function main(url) {
    console.log("Download path:", program.opts().path);
    console.log(program.opts());
    await fetchImages(url, program.level);
}

/* 
    The function fetchImages is defined as an async function that takes
	two parameters: url and depth.


    The response.data property contains the HTML content of the response, which is stored in the html variable.
    The cheerio.load(html) function is used to load the HTML content into a Cheerio object, which is assigned to the $ variable. This allows us to use jQuery-like syntax to traverse and manipulate the HTML.

*/
async function fetchImages(url, depth) {
    if (depth <= 0) {
        return;
    }
    //The try block is used to handle any errors that
	//may occur during the execution of the code inside it.
    try {
    	//The axios.get(url) function is used to make an HTTP GET request to the provided url. 
		//The response is stored in the response variable.;
        const response = await axios.get(url);
 		
		//The response.data property contains the HTML content of the response, 
		//which is stored in the html variable.
        const html = response.data;

		//The cheerio.load(html) function is used to load the HTML content into a Cheerio object,
		//which is assigned to the $ variable. This allows us to use jQuery-like syntax to 
		//traverse and manipulate the HTML.
        const $ = cheerio.load(html);

		//The $('img').each() function selects all img elements in the HTML 
		//and iterates over them using the provided callback function.
		//Inside the callback function, $(element) is used to create a
		//Cheerio object from the current img element
        $('img').each((index, element) => {
 	
			//$(element).attr('src') retrieves the value of the src attribute 
			//of the img element, which is assigned to the imageUrl variable.
            let imageUrl = $(element).attr('src');

			//urlLib.resolve(url, imageUrl) resolves the imageUrl relative to the url, 
			//ensuring that we have the absolute URL of the image.
            imageUrl = urlLib.resolve(url, imageUrl);

			//The if statement checks if the file extension of the imageUrl is in the VALID_EXTENSIONS array. 
			//If it is, the downloadImage function is called with the imageUrl as an argument.
            if (VALID_EXTENSIONS.includes(path.extname(imageUrl).toLowerCase())) {
                downloadImage(imageUrl);
            }
        });

        if (program.recursive) {
			//The $('a').each() function selects all a elements in the HTML 
			//and iterates over them using the provided callback function.
            $('a').each((index, element) => {

				//$(element).attr('href') retrieves the value of the href attribute of the a element,
				//which is assigned to the linkUrl variable.
                let linkUrl = $(element).attr('href');

				//urlLib.resolve(url, linkUrl) resolves the linkUrl relative to the url,
				//ensuring that we have the absolute URL of the linked page.               
				linkUrl = urlLib.resolve(url, linkUrl);

				//The fetchImages function is recursively called with the linkUrl and depth - 1 as arguments, 
				//reducing the depth level by 1.            
				fetchImages(linkUrl, depth - 1);
            });
        }
    } catch (error) {
        console.error(`Error fetching images from ${url}: ${error.message}`);
    }
}

async function downloadImage(imageUrl) {
    try {
		//non string error check
        if (typeof imageUrl !== 'string') {
            console.error(`Invalid image URL: ${imageUrl}`);
            return;
        }

		//The axios.get(imageUrl, { responseType: 'arraybuffer' }) function 
		//is used to make an HTTP GET request to the provided imageUrl with 
		//the responseType set to 'arraybuffer'. The response is stored in the image variable.
        const image = await axios.get(imageUrl, { responseType: 'arraybuffer' });

		//The path.basename(imageUrl) function is used to extract the filename
		//from the imageUrl and store it in the filename variable.
        const filename = path.basename(imageUrl);

		//non string error check.
        if (typeof program.opts().path !== 'string') {
            console.error(`Invalid download path: ${program.opts().path}`);
            return;
        }

		//The path.join(program.opts().path, filename) function is used to 
		//join the program.opts().path and filename to create the output 
		//path for the downloaded image, which is stored in the outputPath variable.
		const outputPath = path.join(program.opts().path, filename);

		//The fs.existsSync(program.opts().path) function checks if the directory
		//specified by program.opts().path exists. If it doesn't, the directory is 
		//created using fs.mkdirSync(program.opts().path, { recursive: true }).
        if (!fs.existsSync(program.opts().path)) {
            fs.mkdirSync(program.opts().path, { recursive: true });
        }

		//The fs.writeFileSync(outputPath, image.data) function writes the image data to the outputPath file.
        fs.writeFileSync(outputPath, image.data);
        console.log(`Image downloaded: ${imageUrl}`);
    } catch (error) {
        console.error(`Error downloading ${imageUrl}: ${error.message}`);
    }
}

