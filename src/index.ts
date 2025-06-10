/**
 * webp-converter
 *
 * Converts image files (.jpg, .jpeg, .png, .svg) to WebP format
 * Preserves original directory structure under specified output folder
 *
 * Example usage:
 *
 * yarn run convert
 *
 * @author byldrma3
 * @version 1.0.0
 */

import fs from 'fs'
import path from 'path'

import fg from 'fast-glob'
import sharp from 'sharp'

export interface ConvertOptions {
    /**
     * Quality of the output WebP images (0-100)
     * Default is 100 (highest quality)
     */
    quality?: number
    /**
     * Array of file extensions to convert
     * Default is ['.jpg', '.jpeg', '.png', '.svg']
     */
    extensions?: string[]
    /**
     * Whether to log verbose output
     * Default is true
     */
    verbose?: boolean
}

/**
 * Converts supported image files from inputDir to .webp format in outputDir
 */
export const convert = async (
    inputDir: string = 'public/images',
    outputDir: string = 'public/webp',
    options: ConvertOptions = {},
): Promise<void> => {
    const {
        quality = 100,
        extensions = ['.jpg', '.jpeg', '.png', '.svg'],
        verbose = true,
    } = options

    const absInput = path.resolve(inputDir)
    const absOutput = path.resolve(outputDir)

    if (verbose) logger.looking(`Looking inside: ${absInput}`)

    const files = await fg(`${absInput}/**/*.*`)

    if (verbose) logger.found(`Found ${files.length} files`)

    for (const file of files) {
        const ext = path.extname(file).toLowerCase()
        if (!extensions.includes(ext)) continue

        const relativePath = path.relative(absInput, file)
        const dir = path.dirname(relativePath)
        const fileName = path.basename(file, ext)

        const outputSubdir = path.join(absOutput, dir)
        const outputFile = path.join(outputSubdir, `${fileName}.webp`)
        const logOutputPath = path.relative(absOutput, outputFile)

        if (!fs.existsSync(outputSubdir)) {
            fs.mkdirSync(outputSubdir, { recursive: true })
        }

        if (fs.existsSync(outputFile)) {
            if (verbose)
                logger.skipped(`Skipped: ${fileName}.webp (already exists)`)
            continue
        }

        try {
            await sharp(file).webp({ quality }).toFile(outputFile)
            if (verbose)
                logger.success(`Converted: ${relativePath} → ${logOutputPath}`)
        } catch (error) {
            logger.error(`Failed to convert: ${relativePath}`, error)
        }
    }
}

const logger = {
    success: (message: string) => console.log(`✅  ${message}`),
    skipped: (message: string) => console.log(`⏭️ ${message}`),
    found: (message: string) => console.log(`🔍 ${message}`),
    looking: (message: string) => console.log(`📂 ${message}`),
    error: (message: string, error: unknown) =>
        console.error(`❌ ${message}`, error),
}

convert()
