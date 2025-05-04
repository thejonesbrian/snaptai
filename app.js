// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileUpload = document.getElementById('file-upload');
const translateBtn = document.getElementById('translate-btn');
const resultsSection = document.getElementById('results-section');
const resultsText = document.getElementById('results-text');
const copyBtn = document.getElementById('copy-btn');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeModal = document.getElementById('close-modal');
const gotItBtn = document.getElementById('got-it-btn');
const processingIndicator = document.getElementById('processing-indicator');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressText = document.getElementById('progress-text');
const uploadInstructions = document.getElementById('upload-instructions');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const changeImageBtn = document.getElementById('change-image-btn');
const removeImageBtn = document.getElementById('remove-image-btn');

// Current image data
let currentImageBlob = null;

// Drop zone events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropZone.classList.add('active');
}

function unhighlight() {
    dropZone.classList.remove('active');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
        handleFiles(files);
    }
}

fileUpload.addEventListener('change', function () {
    if (this.files.length) {
        handleFiles(this.files);
    }
});

// Handle image files
function handleFiles(files) {
    const file = files[0];
    if (!file.type.match('image.*')) {
        alert('Please select an image file.');
        return;
    }

    currentImageBlob = file;

    const reader = new FileReader();
    reader.onload = function (e) {
        showPreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Paste from clipboard (now works anywhere on the page)
document.addEventListener('paste', function (e) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            currentImageBlob = blob;

            const reader = new FileReader();
            reader.onload = function (event) {
                showPreview(event.target.result);
            };
            reader.readAsDataURL(blob);
            break;
        }
    }
});

// Show image preview in the upload box
function showPreview(imageData) {
    imagePreview.src = imageData;
    uploadInstructions.classList.add('hidden');
    imagePreviewContainer.classList.remove('hidden');
    dropZone.classList.remove('active');
}

// Change image button
changeImageBtn.addEventListener('click', function () {
    fileUpload.click();
});

// Remove image button
removeImageBtn.addEventListener('click', function () {
    currentImageBlob = null;
    imagePreview.src = '';
    uploadInstructions.classList.remove('hidden');
    imagePreviewContainer.classList.add('hidden');
    resultsSection.classList.add('hidden');
});

// Translate button - now with actual OCR functionality
translateBtn.addEventListener('click', function () {
    if (!currentImageBlob) {
        alert('Please upload or paste an image first.');
        return;
    }

    // Show processing indicator
    processingIndicator.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    processingIndicator.scrollIntoView({ behavior: 'smooth' });

    // Reset progress bar
    progressBarFill.style.width = '0%';
    progressText.textContent = 'Initializing OCR engine...';

    // Perform OCR using Tesseract.js
    Tesseract.recognize(
        currentImageBlob,
        'eng', // Language code (English)
        {
            logger: m => {
                // Update progress
                if (m.status === 'recognizing text') {
                    const progress = Math.round(m.progress * 100);
                    progressBarFill.style.width = `${progress}%`;
                    progressText.textContent = `Processing: ${progress}%`;
                } else {
                    progressText.textContent = m.status;
                }
            }
        }
    ).then(({ data: { text } }) => {
        // OCR completed successfully
        resultsText.value = text;

        // Hide processing indicator and show results
        processingIndicator.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }).catch(err => {
        console.error('OCR Error:', err);
        progressText.textContent = 'Error processing image';

        // Hide processing indicator after a delay
        setTimeout(() => {
            processingIndicator.classList.add('hidden');
            alert('Error processing image. Please try again with a clearer image.');
        }, 1000);
    });
});

// Copy button
copyBtn.addEventListener('click', function () {
    resultsText.select();
    document.execCommand('copy');

    // Show feedback
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
    }, 2000);
});

// Help modal
helpBtn.addEventListener('click', function () {
    helpModal.classList.remove('invisible', 'opacity-0');
    helpModal.classList.add('visible', 'opacity-100');
});

// Close modal buttons
closeModal.addEventListener('click', closeHelpModal);
gotItBtn.addEventListener('click', closeHelpModal);

function closeHelpModal() {
    helpModal.classList.remove('visible', 'opacity-100');
    helpModal.classList.add('invisible', 'opacity-0');
}

// Close modal when clicking outside
window.addEventListener('click', function (e) {
    if (e.target === helpModal) {
        closeHelpModal();
    }
});