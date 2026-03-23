let imgBox = document.getElementById("imgBox");
let qrImage = document.getElementById("qrImage");
let qrText = document.getElementById("qrText");
let actionBtns = document.getElementById("actionBtns");

function genz() {
    if (qrText.value.trim().length > 0) {
        const url =
            "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
            encodeURIComponent(qrText.value);

        qrImage.src = url;
        imgBox.classList.add("show-img");

        qrImage.onload = () => {
            actionBtns.classList.add("show-actions");
        };
    } else {
        qrText.classList.add("error");
        setTimeout(() => qrText.classList.remove("error"), 500);
    }
}

// Allow Enter key to trigger generation
qrText.addEventListener("keydown", (e) => {
    if (e.key === "Enter") genz();
});

// ── Download ──────────────────────────────────────────────
async function downloadQR() {
    const btn = document.getElementById("downloadBtn");
    btn.classList.add("loading");
    btn.textContent = "Downloading…";

    try {
        const response = await fetch(qrImage.src);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "qr-code.png";
        a.click();

        URL.revokeObjectURL(blobUrl);
        btn.textContent = "Downloaded!";
    } catch {
        btn.textContent = "Failed Retry";
    } finally {
        setTimeout(() => {
            btn.classList.remove("loading");
            btn.textContent = "⬇ Download";
        }, 2000);
    }
}

// ── Share ─────────────────────────────────────────────────
async function shareQR() {
    const btn = document.getElementById("shareBtn");

    // Try native Web Share API first (mobile / modern browsers)
    if (navigator.share) {
        try {
            const response = await fetch(qrImage.src);
            const blob = await response.blob();
            const file = new File([blob], "qr-code.png", { type: "image/png" });

            await navigator.share({
                title: "QR Code",
                text: `QR code for: ${qrText.value}`,
                files: [file],
            });
            return;
        } catch (err) {
            if (err.name === "AbortError") return; // user cancelled
        }
    }

    // Fallback: copy the QR image URL to clipboard
    try {
        await navigator.clipboard.writeText(qrImage.src);
        btn.textContent = "✓ Link Copied!";
    } catch {
        prompt("Copy this QR image URL:", qrImage.src);
    } finally {
        setTimeout(() => (btn.textContent = "Share"), 2000);
    }
}