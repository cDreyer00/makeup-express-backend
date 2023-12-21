const instructions = document.getElementById('instructions');
const baseInstruction = document.getElementsByClassName('instruction')[0];
const loadBtn = document.getElementById('load');

const apiKeyInput = document.getElementById('apiKey');
const apiKey = localStorage.getItem('apiKey');
apiKeyInput.value = apiKey;    

document.getElementById('apiKey').addEventListener('change', () => localStorage.setItem('apiKey', apiKeyInput.value));
document.getElementById('save').addEventListener('click', () => save());
loadBtn.addEventListener('change', (e) => load(e));

document.getElementById('imgInput').addEventListener('change', function (event) {
    var reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('preview').src = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
});

function Download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

const clone = (target) => {
    const clone = target.cloneNode(true);
    clone.id = "clone";
    instructions.appendChild(clone);
    addListeners(clone);
    return clone;
}

const remove = (target) => {
    if (instructions.children.length > 1) {
        instructions.removeChild(target);
    }
    else {
        target.getElementsByTagName('textarea')[0].value = '';
        // target.getElementsByClassName('prevRes')[0].checked = false;
    }
}

const addListeners = (target) => {
    target.getElementsByTagName('input')[0].addEventListener('click', () => clone(target));
    target.getElementsByTagName('input')[1].addEventListener('click', () => remove(target));
    // target.getElementsByClassName('prevRes')[0].addEventListener('change', () => save());
}

addListeners(baseInstruction);

const save = () => {
    const prompts = [];
    for (let i = 0; i < instructions.children.length; i++) {
        const instruction = instructions.children[i];
        const prompt = instruction.getElementsByTagName('textarea')[0].value;
        if (prompt == '') {
            continue;
        }
        prompts.push({ prompt });
    }
    console.log(prompts);
    // download prompts into a file
    Download('prompts.txt', JSON.stringify(prompts));
}

const load = (e) => {
    // e.preventDefault();
    const reader = new FileReader();
    reader.onload = (e) => {
        let prompts;
        try {
            prompts = JSON.parse(e.target.result);
        }
        catch (err) {
            console.log(err);
            return;
        }

        instructions.innerHTML = '';
        instructions.appendChild(baseInstruction);

        for (let i = 0; i < prompts.length; i++) {
            const prompt = prompts[i];
            if (i == 0) {
                baseInstruction.getElementsByTagName('textarea')[0].value = prompt.prompt;
                continue;
            }
            const c = clone(baseInstruction);
            c.getElementsByTagName('textarea')[0].value = prompt.prompt;
        }
        loadBtn.value = '';
    };
    reader.readAsText(e.target.files[0]);
}