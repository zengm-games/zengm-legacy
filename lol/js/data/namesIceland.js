/**
 * @name data.names
 * @namespace First names and last names.
 */
define([], function () {
    "use strict";

    var first, last;

    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    first = [
			 ["Úlfangur"],
			["Helgi"],
			["Frey"],
			["Bjartur"],
			["Áskell"],
			["Ásvaldur"],
			["Rögnvar"],
			["Sigurlaugur"],
			["Gnúpur"],
			["Svavar"],
			["Demus"],
			["Ingþór"],
			["Þiðrandi"],
			["Össur"],
			["Skírnir"],
			["Valbjörn"],
			["Sören"],
			["Marthen"],
			["Hugleikur"],
			["Ísleifur"],
			["Rósberg"],
			["Jósteinn"],
			["Auðólfur"],
			["Leonardo"],
			["Oddfreyr "],
			["Svangeir"],
			["Auðbert"],
			["Dagfari"],
			["Daníval"],
			["Engill"],
			["Þorleikur"],
			["Ketill"],
			["Trostan"],
			["Blævar"],
			["Styr"],
			["Esekíel"],
			["Sigmar"],
			["Gylfi "],
			["Bjarnhéðinn"],
			["Rögnvaldur"],
			["Sigurbjartur"],
			["Tryggvi"],
			["Lars"],
			["Hallgarður"],
			["Rögnvaldur"],
			["Oddleifur"],
			["Sólbjörn"],
			["Mikael"],
			["Hraunar"],
			["Kristgeir"],
			["Gunnröður"],
			["Hafliði"],
			["Grankell "],
			["Sumarliði"],
			["Alexíus"],
			["Eysteinn"],
			["Elfráður"],
			["Eilífur"],
			["Eiríkur"],
			["Rósenberg"],
			["Óskar"],
			["Antoníus"],
			["Úlfar"],
			["Holgeir"],
			["Kár"],
			["Vékell"],
			["Agni"],
			["Unnar"],
			["Egill"],
			["Runólfur"],
			["Vignir"],
			["Kaleb"],
			["Magngeir"],
			["Stórólfur"],
			["Eylaugur"],
			["Dagfinnur"]	

    ];

    // http://www.census.gov/genealogy/www/data/1990surnames/names_files.html
    // Name, Cumulative Frequency
    last = [
			["Öndólfursson",10],
			["Ásviðursson",20],
			["Auðbjörnsson",30],
			["Björnsson",35],
			["Bergsteinnsson",49],
			["Ingjaldursson",55],
			["Vilbergursson",60],
			["Hildibergursson",62],
			["Blærsson",63],
			["Embreksson",65],
			["Hrollaugursson",66],
			["Hólmkellsson",68],
			["Svanbjörnsson",69],
			["Markþórsson",71],
			["Jómundursson",73],
			["Mikjállsson",74.5],
			["Dósóþeusson",75],
			["Fritzsson",77],
			["Angusson",79],
			["Ágústsson",80],
			["Húnnsson",85],
			["Hrafnbergursson",86],
			["Eggertsson",88],
			["Styrsson",90],
			["Eðvaldsson",92],
			["Guðlaugursson",93],
			["Edwardsson",95],
			["Arnviðursson",96],
			["Kristvaldursson",98],
			["Snjólfursson",100],		
			["Friðólfursson",102]	

    ];


	
    return {
        first: first,
        last: last
    };
});