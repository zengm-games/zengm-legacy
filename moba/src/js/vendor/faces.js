/* eslint-disable */

// in which directories the SVG files are stored.
var paths = {
    'root': '/img/svg_face_partials/', // location where the library of SVG files is stored.
    'partials': {
        'ears': 'ears/',
        'eyebrows': 'eyebrows/',
        'eyes': 'eyes/',
        'faceforms': 'faceforms/',
        'haircuts': 'haircuts/',
        'mouths': 'mouths/',
        'noses': 'noses/',
        'glasses': 'glasses/'
    }
};

// which of the SVG file are allowed to be picked when generating a face.
var partialFileNames = {
    'ears': ['1.svg', '2.svg', '3.svg'],
    'glasses': ['1.svg', '2.svg', '3.svg', 'none.svg'],
    'eyebrows': ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg', '7.svg', '8.svg', '9.svg'],
    'eyes': ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg'],
    'faceforms': ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg', '7.svg', '8.svg', '9.svg', '10.svg', '11.svg', '12.svg'],
    'haircuts': ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg', '7.svg', '8.svg', '9.svg', '10.svg', '11.svg', '12.svg', '13.svg', '14.svg', '15.svg', '16.svg', '17.svg', '18.svg', '19.svg', '20.svg'],
    'mouths': ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg', '7.svg'],
    'noses': ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg']
};
// group the partials by region/country, randomly select from narrower group
var partialFileNamesAsian = {
    'ears': ['1.svg', '2.svg', '3.svg'],
    'glasses': ['1.svg', '2.svg', '3.svg', 'none.svg'],
    'eyebrows': ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg', '7.svg', '8.svg', '9.svg'],
    'eyes': ['3.svg','5.svg'],
    'faceforms': ['1.svg', '2.svg', '3.svg', '6.svg', '8.svg', '9.svg', '10.svg'],
    'haircuts': [ '3.svg', '6.svg','10.svg', '12.svg', '13.svg', '14.svg', '15.svg', '16.svg'],
    'mouths': ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg', '7.svg'],
    'noses': ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg']
};	
var partialFileNamesNA = {
    'ears': ['1.svg', '2.svg', '3.svg'],
    'glasses': ['1.svg', '2.svg', '3.svg', 'none.svg'],
    'eyebrows': ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg', '7.svg', '8.svg', '9.svg'],
    'eyes': ['1.svg', '2.svg',  '4.svg'],
    'faceforms': ['1.svg', '2.svg', '3.svg', '6.svg', '8.svg', '9.svg', '10.svg'],
    'haircuts': ['1.svg', '2.svg', '4.svg', '5.svg', '7.svg', '8.svg', '9.svg', '11.svg','17.svg', '18.svg', '19.svg', '20.svg'],
    'mouths': ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg', '7.svg'],
    'noses': ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg']
};		

// colors to be randomly picked when generating a face.
var colors = {
    'skinColors': ['#e3ad82', '#ad8363', '#876852', '#f2d6cb', '#ddb7a0'],
    'hairColors': ['#513a2d', '#9d7057', '#938a73', '#b55239', '#e6cea8', '#000000']
};
var colorsAsian = {
    'skinColors': ['#e3ad82', '#ad8363',  '#ddb7a0'],
    'hairColors': ['#000000']
};	
var colorsNA = {
    'skinColors': ['#e3ad82',  '#f2d6cb', '#ddb7a0'],
    'hairColors': ['#513a2d', '#9d7057', '#b55239',  '#000000']
};		

function getRandomItem(array) {
    var randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

/**
 * Display a face.
 *
 * @param {string} container id of the div that the face will appear in. If not given, no face is drawn and the face object is simply returned.
 * @param {Object} face Face object, such as one generated from faces.generate.
 */
function display(container, face) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    if(face === undefined){
        console.log('No face passed to display as an argument. Generating a new one.');
        face = generate(); // is no face passed in, generate a new random face.
    }

    container.innerHTML = "";

    //SVG partials are dropped in it's personal boxes. Boxes has different CSS classes (z-index differs) and different 'data-face-part-type' attr to identify itself.
    function placePartialsBoxes() {
        container.innerHTML  = '<div data-face-part-type="ear" class="js-face-part face__part face__part--lowest"></div>' +
            '<div data-face-part-type="faceform" class="js-face-part face__part face__part--low"></div>' +
            '<div data-face-part-type="eyebrow" class="js-face-part face__part face__part--middle"></div>' +
            '<div data-face-part-type="eye" class="js-face-part face__part face__part--middle"></div>' +
            '<div data-face-part-type="mouth" class="js-face-part face__part face__part--middle"></div>' +
            '<div data-face-part-type="nose" class="js-face-part face__part face__part--middle"></div>' +
            '<div data-face-part-type="haircut" class="js-face-part face__part face__part--upper"></div>' +
            '<div data-face-part-type="glasses" class="js-face-part face__part face__part--top"></div>';
    }

    function placePartial(path, type) {
        function getSVGfile(path) {
            fetch(path)
                .then(response => response.text())
                .then(svg => placeSVGcontent(type, svg));
        }

        function placeSVGcontent(type, SVGcode) {
            // find inside the container a '.js-face-part' element of the 'data-face-part-type' type. All the '.js-face-part' elements are generated right before SVG placing.
            var facePartialBox = container.querySelector('.js-face-part[data-face-part-type' + '=' + type + ']');

            //fill in the face partial box with the received SVG code
            facePartialBox.innerHTML = SVGcode;
        }

        getSVGfile(path);
    }

    function colorFaceParts(skinColor, hairColor) {
        // adding a <style> tag to color skin and hairs SVG paths.
        var styleTag = document.createElement("style");
        var styles = '#body_color_path{fill: ' + skinColor + '} #haircut_color_path{fill: ' + hairColor + '}';

        styleTag.innerHTML = '/*JavaScript produced styles by the face generator*/' + styles;
        document.head.appendChild(styleTag);
    }

    // first, place all the empty boxes for coming next SVG partials.
    placePartialsBoxes();

    // second, loop through each of face partial type and place everyone's SVG file.
    for(var partialName in face.partials) {
        // if a path is an empty string, do not place that particle.
        if(face.partials[partialName]){
            placePartial(face.partials[partialName], partialName);
        }
    }

    // third, generate a <style> tag containing colors. done.
    colorFaceParts(face.colors["skinColor"], face.colors["hairColor"]);
}

/**
 * Generate a random face.
 *
 * @param {string} container id of the div that the face will appear in. If not given, no face is drawn and the face object is simply returned.
 * @param {Object} chances object. Describes a chance of appearing accessories or specific face types.
 * @return {Object} Randomly generated face object.
 */
function generate(region,container, chances) {
    if(chances === undefined){
        chances = {};
        chances["glasses"] = 0; //no glasses by default
    }

    function returnTrueWithChance(chance) {
        //picks a number between 0 (including 0) and 100/chance. E.g., for a chance of 25% (25) picks a number between 0 and 3
        var randomResult = Math.floor(Math.random() * 100/chance);

        return randomResult === 0;
    }

    
    var face = {
        'partials': {
            'ear': paths.root + paths.partials.ears + getRandomItem(partialFileNames.ears),
            'eyebrow': paths.root + paths.partials.eyebrows + getRandomItem(partialFileNames.eyebrows),
            'eye': paths.root + paths.partials.eyes + getRandomItem(partialFileNames.eyes),
            'faceform': paths.root + paths.partials.faceforms + getRandomItem(partialFileNames.faceforms),
            'haircut': paths.root + paths.partials.haircuts + getRandomItem(partialFileNames.haircuts),
            'mouth': paths.root + paths.partials.mouths + getRandomItem(partialFileNames.mouths),
            'nose': paths.root + paths.partials.noses + getRandomItem(partialFileNames.noses),
            'glasses': returnTrueWithChance(chances['glasses']) ? paths.root + paths.partials.glasses + getRandomItem(partialFileNames.glasses) : paths.root + paths.partials.glasses + 'none.svg' //we show the glasses with a certain chance. if the value returned by the returnTrueWithChance() function is false, than empty string returned and no glasses loaded.
        },
        'colors': {
            'skinColor': getRandomItem(colors.skinColors),
            'hairColor': getRandomItem(colors.hairColors)
        }
    };
    
    var faceAsian = {
        'partials': {
            'ear': paths.root + paths.partials.ears + getRandomItem(partialFileNamesAsian.ears),
            'eyebrow': paths.root + paths.partials.eyebrows + getRandomItem(partialFileNamesAsian.eyebrows),
            'eye': paths.root + paths.partials.eyes + getRandomItem(partialFileNamesAsian.eyes),
            'faceform': paths.root + paths.partials.faceforms + getRandomItem(partialFileNamesAsian.faceforms),
            'haircut': paths.root + paths.partials.haircuts + getRandomItem(partialFileNamesAsian.haircuts),
            'mouth': paths.root + paths.partials.mouths + getRandomItem(partialFileNamesAsian.mouths),
            'nose': paths.root + paths.partials.noses + getRandomItem(partialFileNamesAsian.noses),
            'glasses': returnTrueWithChance(chances['glasses']) ? paths.root + paths.partials.glasses + getRandomItem(partialFileNamesAsian.glasses) : paths.root + paths.partials.glasses + 'none.svg' //we show the glasses with a certain chance. if the value returned by the returnTrueWithChance() function is false, than empty string returned and no glasses loaded.
        },
        'colors': {
            'skinColor': getRandomItem(colorsAsian.skinColors),
            'hairColor': getRandomItem(colorsAsian.hairColors)
        }
    };		
    
    var faceNA = {
        'partials': {
            'ear': paths.root + paths.partials.ears + getRandomItem(partialFileNamesNA.ears),
            'eyebrow': paths.root + paths.partials.eyebrows + getRandomItem(partialFileNamesNA.eyebrows),
            'eye': paths.root + paths.partials.eyes + getRandomItem(partialFileNamesNA.eyes),
            'faceform': paths.root + paths.partials.faceforms + getRandomItem(partialFileNamesNA.faceforms),
            'haircut': paths.root + paths.partials.haircuts + getRandomItem(partialFileNamesNA.haircuts),
            'mouth': paths.root + paths.partials.mouths + getRandomItem(partialFileNamesNA.mouths),
            'nose': paths.root + paths.partials.noses + getRandomItem(partialFileNamesNA.noses),
            'glasses': returnTrueWithChance(chances['glasses']) ? paths.root + paths.partials.glasses + getRandomItem(partialFileNamesNA.glasses) : paths.root + paths.partials.glasses + 'none.svg' //we show the glasses with a certain chance. if the value returned by the returnTrueWithChance() function is false, than empty string returned and no glasses loaded.
        },
        'colors': {
            'skinColor': getRandomItem(colorsNA.skinColors),
            'hairColor': getRandomItem(colorsNA.hairColors)
        }
    };		

    if (region == "KR" || region == "TW" || region == "CN" || region == "SEA" || region == "JP") {
        face = faceAsian;
//		} else if (region == "NA" || region == "EU" ) {
    } else {
        face = faceNA;
    }
    //console.log(region);
    if (typeof container !== "undefined") {
        display(container, face);
    }

    return face;
}

export default {
    display: display,
    generate: generate,
    partialFileNames: partialFileNames, // may be needed to display all the partials to choose from.
    paths: paths
};
