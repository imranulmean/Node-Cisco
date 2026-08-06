import fs from "fs";
import path from "path";
import sharp from "sharp";
import Tesseract from "tesseract.js";
import { PDFDocument } from "pdf-lib";
import { Poppler } from "node-poppler";

/***************************************************
 * CONFIG
 ***************************************************/

const PDF_FILE =
"D:/Node/MERN-Stack/Node-Cisco/client/public/localFolder/Procurement_Policy_2026_Organized.pdf";

// CHANGE THIS
const POPPLER_PATH =
"C:/poppler-26.02.0/Library/bin";

const IMAGE_DIR = "./pages";
const OUTPUT = "./sorted.pdf";
const OCR_JSON = "./ocr-results.json";

/***************************************************
 * CLEAN
 ***************************************************/

if (fs.existsSync(IMAGE_DIR)) {
    fs.rmSync(IMAGE_DIR, {
        recursive: true,
        force: true
    });
}

fs.mkdirSync(IMAGE_DIR, {
    recursive: true
});

/***************************************************
 * LOAD PDF
 ***************************************************/

const poppler = new Poppler(POPPLER_PATH);

const pdfBytes = fs.readFileSync(PDF_FILE);

const sourcePdf =
    await PDFDocument.load(pdfBytes);

const totalPages =
    sourcePdf.getPageCount();

console.log("================================");
console.log("TOTAL PAGES:", totalPages);
console.log("================================");

/***************************************************
 * OCR PAGE NUMBER
 ***************************************************/

function extractPageNumber(text) {

    text = text
        .replace(/\r/g, " ")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ");

    const patterns = [

        /(\d+)\s*\|\s*Page/i,

        /(\d+)\s*\|\s*Paqe/i,

        /(\d+)\s*Page/i,

        /Page\s*(\d+)/i,

        /Page[- ]*(\d+)/i

    ];

    for (const p of patterns) {

        const m = text.match(p);

        if (m) {

            return parseInt(
                m[1],
                10
            );

        }

    }

    return null;

}

/***************************************************
 * STORE RESULT
 ***************************************************/

const pageMap = [];
/***************************************************
 * RENDER PDF + OCR
 ***************************************************/

for (let page = 1; page <= totalPages; page++) {

    console.log(`\n========== PAGE ${page}/${totalPages} ==========`);

    await poppler.pdfToCairo(
        PDF_FILE,
        `${IMAGE_DIR}/page-${page}`,
        {
            pngFile: true,
            firstPageToConvert: page,
            lastPageToConvert: page
        }
    );

    const imageFile = fs
        .readdirSync(IMAGE_DIR)
        .find(file =>
            file.startsWith(`page-${page}-`) &&
            file.endsWith(".png")
        );

    if (!imageFile) {

        console.log("Image not generated.");

        pageMap.push({
            pdfIndex: page - 1,
            printedPage: null,
            image: null,
            text: ""
        });

        continue;
    }

    const imagePath =
        path.join(IMAGE_DIR, imageFile);

    console.log("Image:", imageFile);

    // Optional enhancement
    const enhanced =
        path.join(
            IMAGE_DIR,
            `enhanced-${page}.png`
        );

    await sharp(imagePath)
        .grayscale()
        .normalize()
        .sharpen()
        .png()
        .toFile(enhanced);

    console.log("Running OCR...");

    const {
        data: { text }
    } =
        await Tesseract.recognize(
            enhanced,
            "eng",
            {
                logger: m => {

                    if (
                        m.status ===
                        "recognizing text"
                    ) {

                        process.stdout.write(
                            `\rOCR ${Math.round(
                                m.progress * 100
                            )}%`
                        );

                    }

                }

            }
        );

    console.log("\n");

    const printed =
        extractPageNumber(text);

    console.log(
        "Detected Printed Page:",
        printed
    );

    pageMap.push({

        pdfIndex: page - 1,

        printedPage: printed,

        image: imageFile,

        text

    });

}
/***************************************************
 * SAVE OCR RESULTS
 ***************************************************/

fs.writeFileSync(
    OCR_JSON,
    JSON.stringify(pageMap, null, 4)
);

console.log("\n====================================");
console.log("OCR RESULTS SAVED");
console.log(OCR_JSON);
console.log("====================================");

/***************************************************
 * SHOW FAILED OCR
 ***************************************************/

const failedPages =
    pageMap.filter(
        x => x.printedPage === null
    );

console.log(
    `OCR Failed: ${failedPages.length}`
);

if (failedPages.length) {

    console.table(
        failedPages.map(x => ({

            pdfPage:
                x.pdfIndex + 1,

            image:
                x.image

        }))
    );

}

/***************************************************
 * REMOVE DUPLICATES
 ***************************************************/

const seen = new Set();

const duplicates = [];

for (const item of pageMap) {

    if (item.printedPage == null)
        continue;

    if (seen.has(item.printedPage)) {

        duplicates.push(item);

    } else {

        seen.add(item.printedPage);

    }

}

if (duplicates.length) {

    console.log(
        "\nDuplicate Printed Pages:"
    );

    console.table(
        duplicates.map(x => ({
            pdfPage:
                x.pdfIndex + 1,
            printedPage:
                x.printedPage
        }))
    );

}

/***************************************************
 * SORT BY PRINTED PAGE
 ***************************************************/

pageMap.sort((a, b) => {

    if (
        a.printedPage == null &&
        b.printedPage == null
    )
        return 0;

    if (a.printedPage == null)
        return 1;

    if (b.printedPage == null)
        return -1;

    return (
        a.printedPage -
        b.printedPage
    );

});

console.log("\n====================================");
console.log("FIRST 20 SORTED PAGES");
console.log("====================================");

console.table(
    pageMap
        .slice(0, 20)
        .map(x => ({

            pdfPage:
                x.pdfIndex + 1,

            printedPage:
                x.printedPage

        }))
);
/***************************************************
 * CREATE SORTED PDF
 ***************************************************/

console.log("\n====================================");
console.log("CREATING SORTED PDF...");
console.log("====================================");

const outputPdf = await PDFDocument.create();

let added = 0;

for (const item of pageMap) {

    if (item.printedPage == null) {

        console.log(
            `Skipping PDF Page ${item.pdfIndex + 1} (OCR failed)`
        );

        continue;

    }

    try {

        const [page] =
            await outputPdf.copyPages(
                sourcePdf,
                [item.pdfIndex]
            );

        outputPdf.addPage(page);

        added++;

        process.stdout.write(
            `\rAdded ${added}/${pageMap.length}`
        );

    } catch (err) {

        console.log(
            `\nFailed to copy page ${item.pdfIndex + 1}`
        );

        console.error(err);

    }

}

console.log("\n");

/***************************************************
 * SAVE PDF
 ***************************************************/

const outputBytes = await outputPdf.save();

fs.writeFileSync(
    OUTPUT,
    outputBytes
);

console.log("====================================");
console.log("DONE");
console.log("====================================");
console.log("Output:", OUTPUT);
console.log("Pages Added:", added);
console.log("Original Pages:", totalPages);

/***************************************************
 * SUMMARY
 ***************************************************/

const detected =
    pageMap.filter(
        x => x.printedPage != null
    ).length;

console.log("\n====================================");
console.log("SUMMARY");
console.log("====================================");

console.table({

    totalPages,

    detectedPages: detected,

    failedPages: totalPages - detected,

    outputPages: added

});

/***************************************************
 * OPTIONAL
 ***************************************************/
// Uncomment this if you want to automatically
// delete the generated images after the PDF is created.

/*
fs.rmSync(IMAGE_DIR, {
    recursive: true,
    force: true
});
*/

console.log("\nFinished.");