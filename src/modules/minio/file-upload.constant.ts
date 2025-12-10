export const FILE_VALIDATORS = [
    {
        type: 'IMAGE',
        mimes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/bmp',
            'image/tiff',
            'image/svg+xml',
            'image/heic',
            'image/heif',
        ],
    },
    {
        type: 'VIDEO',
        mimes: [
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
            'video/webm',
            'video/x-msvideo',
            'video/x-matroska',
            'video/ogg',
            'video/3gpp',
        ],
    },
    {
        type: 'DOCS',
        mimes: [
            'application/pdf',

            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',

            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',

            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            'application/gzip',

            'text/plain',
            'application/rtf',
        ],
    }
];