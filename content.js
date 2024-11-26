console.log("Bionic transform successfully loaded");

function toBionicReading(text) {
    return text.split(" ").map(word => {
        if (word.length > 2) {
            const boldPart = word.slice(0, Math.ceil(word.length / 2));
            const normalPart = word.slice(Math.ceil(word.length / 2));
            return `<b>${boldPart}</b>${normalPart}`;
        }
        return word;
    }).join(" ");
}

function processTextNodes(node) {
    // Process the shadowRoot, if it exists
    if (node.shadowRoot) {
        // console.log("Entering shadow DOM:", node);
        const nestedBodyInShadow = findNestedBody(node.shadowRoot);
        if (nestedBodyInShadow) {
            processTextNodes(nestedBodyInShadow);
        }
    }

    if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) {
        const span = document.createElement("span");
        span.innerHTML = toBionicReading(node.nodeValue);
        node.replaceWith(span);
    } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.nodeName !== "SCRIPT" &&
        node.nodeName !== "STYLE"
    ) {
        node.childNodes.forEach(child => processTextNodes(child));
    }
}

function findNestedBody(node) {
    if (!node) return null;

    // Process the shadowRoot, if it exists
    if (node.shadowRoot) {
        // console.log("Entering shadow DOM:", node);
        const nestedBodyInShadow = findNestedBody(node.shadowRoot);
        if (nestedBodyInShadow) return nestedBodyInShadow;
    }

    // Process regular child elements
    if (node.children) {
        for (const child of node.childNodes) {
            if (target_parts.includes(child.nodeName)
                || target_parts.some(target_part => child.nodeName.includes(target_part))
                ) {
                console.log(child.nodeName)
                return child; // Found the target 
            }
            const nestedBody = findNestedBody(child); // Recurse into child
            if (nestedBody) return nestedBody;
        }
    }
    return null; // No <body> found
}

const target_parts = ["BODY", "MAIN", "ARTICLE"]

// 初始处理
setTimeout(()=>{
    const rootBody = document.querySelector("body");
    const innerBody = findNestedBody(rootBody);
    if (innerBody) {
        processTextNodes(innerBody);
    } else {
        console.warn("Target part(s) not found");
    }
}, 500);

// 动态监听 shadow DOM 的加载
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const innerBody = findNestedBody(node);
                if (innerBody) {
                    // console.log("New nested body detected in shadow DOM");
                    processTextNodes(innerBody);
                }
            }
        });
    });
});

// 开始监听整个文档的 DOM 变化
observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
});

