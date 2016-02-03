# leaflet.crop.js
JavaScript library for drawing the yield maps

The JavaScript library for drawing crop maps. 
This is modified JavaScript code by <a href="https://github.com/Leaflet/Leaflet.heat">Leaflet.heat</a>, but for displaying the map of yelds.

It's built as a <a href="http://leafletjs.com/">Leaflet</a> plugin.

<p>Latest version of the library in the <code>src</code> directory</p>

<h2>Usage</h2>

<div class="highlight highlight-html">
<pre>
&lt;script src='http://gisfile.com/js/leaflet.crop.js'&gt;&lt;/script&gt;
...
var crop = L.cropLayer([[x,y,value], ...], {gradient:[{range:value}, ...]}).addTo(map);
</pre>
</div>

<p>The <code>gleaflet.crop.js</code> file does not includes the Leaflet library. 
You will have to include the Leaflet yourself.</p>
