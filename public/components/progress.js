
class ProgressCompo {
    ProgElem = document.createElement('progress-compo')
    constructor() {
        this.progressBar = document.createElement('progress')
        this.progressBar.style.width = "80%"
        this.ProgElem.innerText = "Please wait . . !"
        this.ProgElem.appendChild(this.progressBar)
        this.ProgElem.style.color = "azure";
        this.ProgElem.style.borderRadius = "5px";
        this.ProgElem.style.width = "15vw";
        this.ProgElem.style.height = "15vh";
        this.ProgElem.style.display = "flex";
        this.ProgElem.style.justifyContent = "space-evenly";
        this.ProgElem.style.flexDirection = "column";
        this.ProgElem.style.alignItems = "center";
        this.ProgElem.style.boxShadow = "10px 10px black"
    }

    get() {
        return this.ProgElem
    }
}
