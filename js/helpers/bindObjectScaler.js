function bindObjectScaler(){

    window.onload=function() {
        document.getElementById('plus').onclick = () => scaleUp(.05)
        document.getElementById('minus').onclick = () => scaleDown(.05)
        document.getElementById('rotate-plus').onclick = () => rotateCW(.05)
        document.getElementById('rotate-minus').onclick = () => rotateCC(.05)
        document.getElementById('clear').onclick = () => clearScale()
        document.getElementById('rotate-clear').onclick = () => clearRotation()

        var a = document.getElementById("svg-object");
        var svgDoc = a.contentDocument;

        var width = document.getElementById("width");
        var height = document.getElementById("height");
        var depth = document.getElementById("depth");

        var lineW = svgDoc.getElementById("lineW");
        var lineH = svgDoc.getElementById("lineH");
        var lineD = svgDoc.getElementById("lineD");

        let sides = [width, height, depth]
        let lines = [lineW, lineH, lineD]
        let activeLines = []

        sides.forEach((side, i) => {
                side.addEventListener('click', function() {
                    
                    if (lines[i].style.stroke !== 'rgb(255, 0, 0)')  {

                    lines[i].style.stroke = 'rgb(255, 0, 0)'

                    if (this.id === 'width') {
                        activeLines.push('width')
                    }
                    if (this.id === 'height') {
                        activeLines.push('height')
                    }
                    if (this.id === 'depth') {
                        activeLines.push('depth')
                    }
                    
                } else {
                    lines[i].style.stroke = '#ffffff'
                    activeLines = activeLines.filter(l => l !== this.id)
                    document.getElementById('plus').onclick = () => scaleUp(.05)
                    document.getElementById('minus').onclick = () => scaleDown(.05)
                    document.getElementById('rotate-plus').onclick = () => rotateCW(.05)
                    document.getElementById('rotate-minus').onclick = () => rotateCC(.05)
                }
                if (activeLines.length === 3 || !activeLines.length) {
                    document.getElementById('plus').onclick = () => {scaleUp(.05)}
                    document.getElementById('minus').onclick = () => {scaleDown(.05)}
                    document.getElementById('rotate-plus').onclick = () => {rotateCW(.05)}
                    document.getElementById('rotate-minus').onclick = () => {rotateCC(.05)}
                }
                if (activeLines.length === 2 && activeLines.includes('width') && activeLines.includes('depth')) {
                    document.getElementById('plus').onclick = () => {scaleX(.05);scaleZ(.05)}
                    document.getElementById('minus').onclick = () => {scaleX(-.05);scaleZ(-.05)}
                    document.getElementById('rotate-plus').onclick = () => {rotateX(.05);rotateZ(.05)}
                    document.getElementById('rotate-minus').onclick = () => {rotateX(-.05);rotateZ(-.05)}
                  
                }
                if (activeLines.length === 2 && activeLines.includes('width') && activeLines.includes('height')) {
                    document.getElementById('plus').onclick = () => {scaleX(.05);scaleY(.05)}
                    document.getElementById('minus').onclick = () => {scaleX(-.05);scaleY(-.05)}
                    document.getElementById('rotate-plus').onclick = () => {rotateX(.05);rotateY(.05)}
                    document.getElementById('rotate-minus').onclick = () => {rotateX(-.05);rotateY(-.05)}
                }
                if (activeLines.length === 2 && activeLines.includes('depth') && activeLines.includes('height')) {
                    document.getElementById('plus').onclick = () => {scaleZ(.05);scaleY(.05)}
                    document.getElementById('minus').onclick = () => {scaleZ(-.05);scaleY(-.05)}
                    document.getElementById('rotate-plus').onclick = () => {rotateZ(.05);rotateY(.05)}
                    document.getElementById('rotate-minus').onclick = () => {rotateZ(-.05);rotateY(-.05)}
                }
                if (activeLines.length === 1) {
                    if (activeLines[0] === 'width') {
                        document.getElementById('plus').onclick = () => {scaleX(.05)}
                        document.getElementById('minus').onclick = () => {scaleX(-.05)}
                        document.getElementById('rotate-plus').onclick = () => {rotateX(.05)}
                        document.getElementById('rotate-minus').onclick = () => {rotateX(-.05)}
                        
                    }
                    if (activeLines[0] === 'height') {
                        document.getElementById('plus').onclick = () => {scaleY(.05)}
                        document.getElementById('minus').onclick = () => {scaleY(-.05)}
                        document.getElementById('rotate-plus').onclick = () => {rotateY(.05)}
                        document.getElementById('rotate-minus').onclick = () => {rotateY(-.05)}
                    }
                    if (activeLines[0] === 'depth') {
                        document.getElementById('plus').onclick = () => {scaleZ(.05)}
                        document.getElementById('minus').onclick = () => {scaleZ(-.05)}
                        document.getElementById('rotate-plus').onclick = () => {rotateZ(.05)}
                        document.getElementById('rotate-minus').onclick = () => {rotateZ(-.05)}
                        document.getElementById('clear').onclick = () => {clearScaleZ()}
                        document.getElementById('rotate-clear').onclick = () => {clearRotationZ()}
                    }
                }
                console.log(activeLines)
            })
                
        })
    };
}