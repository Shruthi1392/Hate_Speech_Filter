
const style=document.createElement("link");
style.rel="stylesheet";
style.href=chrome.runtime.getURL("styles.css");
document.head.appendChild(style);

async function analyzeText(text) {
    const response=await fetch("http://localhost:5000/analyze", {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
        body:JSON.stringify({text})
    });

    if (!response.ok) {
        throw new Error ("API request failed");
    }

    return await response.json();
}

function isHateful(scores) {
    return (
        scores.TOXICITY > 0.8 ||
        scores.SEVERE_TOXICITY>0.8||
        scores.INSULT > 0.8||
        scores.THREAT > 0.8
    );
}

async function scanTextNodes() {
    const elements=[...document.body.querySelectorAll("*")]
    .filter(el=>el.children.length===0 && el.textContent.trim().length>20);

    for (const el of elements) {
        const originalText=el.textContent.trim();
        try {
            const scores=await analyzeText(originalText);
            console.log("Text:",originalText);
            console.log("Scores:",scores);
            console.log("Is Hateful:", isHateful(scores));
            
            if (isHateful(scores)){
                el.classList.add("hateful-blur");
                el.title="Hateful content detected. Click to reveal.";
                el.addEventListener("click", ()=>{
                    el.classList.remove("hateful-blur");
                    el.style.color="inherit";
                });
            }
        }catch (err){
            console.error("Error analyzing text:", err);
        }
    }
}

window.addEventListener("load", ()=> {
    scanTextNodes();

    const observer=new MutationObserver((mutationsList)=> {
        for (const mutation of mutationsList) {
            if (mutation.type==="childList" || mutation.type==="characterData") {
                scanTextNodes();
                break;
            }
        }
    });

    observer.observe(document.body, {
        childList:true,
        subtree:true,
        characterData:true 
    });
});