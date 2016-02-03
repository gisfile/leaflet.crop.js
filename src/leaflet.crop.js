/*
 (c) 2014, Vladimir Agafonkin
 JavaScript library for drawing the crop maps
 Modifed by Sergey Shelkovnikov
*/
!function() {
    "use strict";

    function t(i) {
        return this instanceof t ? (this._canvas = i = "string" == typeof i ? document.getElementById(i) : i, this._ctx = i.getContext("2d"), this._width = i.width, this._height = i.height, this._max = 1, void this.clear()) : new t(i)
    }
    t.prototype = {
        defaultRadius: 25,
        defaultGradient: {.4: "blue", .6: "cyan", .7: "lime", .8: "yellow", 1: "red"
        },
        data: function(t, i) {
            return this._data = t, this
        },
        max: function(t) {
            return this._max = t, this
        },
        add: function(t) {
            return this._data.push(t), this
        },
        clear: function() {
            return this._data = [], this
        },
        radius: function(t, i) {
            i = i || 15;
            var a = this._circle = document.createElement("canvas"),
                s = a.getContext("2d"),
                e = this._r = t + i;
            return a.width = a.height = 2 * e, s.shadowOffsetX = s.shadowOffsetY = 200, s.shadowBlur = i, s.shadowColor = "black", s.beginPath(), s.arc(e - 200, e - 200, t, 0, 2 * Math.PI, !0), s.closePath(), s.fill(), this
        },
        circle: function(t, i, c) {
            var a = this._circle = document.createElement("canvas"),
                s = a.getContext("2d"),
                e = this._r = t + i;
            return a.width = a.height = 2 * e, s.shadowOffsetX = s.shadowOffsetY = 200, s.shadowBlur = i, s.shadowColor = c, s.beginPath(), s.arc(e - 200, e - 200, t, 0, 2 * Math.PI, !0), s.closePath(), s.fill(), this
        },
        gradient: function(t) {
            this.defaultGradient = t;
            var i = document.createElement("canvas"),
                a = i.getContext("2d"),
                s = a.createLinearGradient(0, 0, 0, 256);
            i.width = 1, i.height = 256;
            for (var e in t) s.addColorStop( e >= this._max ? 1 : e / this._max, t[e]);
            return a.fillStyle = s, a.fillRect(0, 0, 1, 256), this._grad = a.getImageData(0, 0, 1, 256).data, this
        },
        getcolor: function(v) {
            var t = this.defaultGradient;
            var i = -1;
            
            for (var e in t) {
                if (i > v) 
                    return t[ e];
                else
                    if (i >= 0 && i <= v && e > v) {
                       return t[ i];
                    }
                
                i = e;
            }
        
            if (i >= 0)
                return t[ i];
        },
        setcircles: function(r, i) {
            var t = this.defaultGradient;
            this.circles = [];
            for (var e in t) {
                this.circle( r, i, t[e]),
                this.circles[ e] = this._circle;
            }
        },
        getcircle: function(v) {
            var t = this.defaultGradient;
            var i = -1;
            
            for (var e in t) {
                if (i > v) {
                    this._circle = this.circles[ e];
                    return this.circles[ e];
                } else
                    if (i >= 0 && i <= v && e > v) {
                       this._circle = this.circles[ i];
                       return this.circles[ i];
                    }
                
                i = e;
            }
        
            if (i >= 0) {
                this._circle = this.circles[ i];
                return this.circles[ i];
            } else {
                return this._circle;
            }
        },
        draw: function(t) {
            this._circle || this.radius(this.defaultRadius), this._grad || this.gradient(this.defaultGradient);
            var i = this._ctx, z = this._map.getZoom();
            i.clearRect(0, 0, this._width, this._height);
            this.setcircles( (z == 18 ? 5 : z == 17 ? 3 : z == 16 ? 2 : 1), 0);
            for (var a, s = 0, e = this._data.length; e > s; s++) {
                a = this._data[s], 
                i.globalAlpha = Math.max( 1 -(a[2] / this._max), t || .05), //Math.max( a[2] / this._max, t || .05), 
                this.getcircle( a[2]), 
                i.drawImage(this._circle, a[0] - this._r, a[1] - this._r);
            }
            var n = i.getImageData(0, 0, this._width, this._height);
            return this._colorize(n.data, this._grad), i.putImageData(n, 0, 0), this
        },
        _colorize: function(t, i) {
        }
    }, window.simplecrop = t
}(),
L.CropLayer = (L.Layer ? L.Layer : L.Class).extend({
    initialize: function(t, i) {
        this._latlngs = t, L.setOptions(this, i)
    },
    setLatLngs: function(t) {
        return this._latlngs = t, this.redraw()
    },
    addLatLng: function(t) {
        return this._latlngs.push(t), this.redraw()
    },
    setOptions: function(t) {
        return L.setOptions(this, t), this._crop && this._updateOptions(), this.redraw()
    },
    redraw: function() {
        return !this._crop || this._frame || this._map._animating || (this._frame = L.Util.requestAnimFrame(this._redraw, this)), this
    },
    onAdd: function(t) {
        this._map = t, this._canvas || this._initCanvas(), t._panes.overlayPane.appendChild(this._canvas), t.on("moveend", this._reset, this), t.options.zoomAnimation && L.Browser.any3d && t.on("zoomanim", this._animateZoom, this), this._reset()
    },
    onRemove: function(t) {
        t.getPanes().overlayPane.removeChild(this._canvas), t.off("moveend", this._reset, this), t.options.zoomAnimation && t.off("zoomanim", this._animateZoom, this)
    },
    addTo: function(t) {
        return t.addLayer(this), this
    },
    _initCanvas: function() {
        var t = this._canvas = L.DomUtil.create("canvas", "leaflet-cropmap-layer leaflet-layer"),
            i = this._map.getSize();
        t.width = i.x, t.height = i.y;
        var a = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(t, "leaflet-zoom-" + (a ? "animated" : "hide")), this._crop = simplecrop(t), this._updateOptions()
    },
    _updateOptions: function() {
        this._crop._map = this._map;
        this._crop.radius(this.options.radius || this._crop.defaultRadius, this.options.blur), this.options.gradient && this._crop.gradient(this.options.gradient), this.options.max && this._crop.max(this.options.max)
    },
    _reset: function() {
        var t = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, t);
        var i = this._map.getSize();
        this._crop._width !== i.x && (this._canvas.width = this._crop._width = i.x), this._crop._height !== i.y && (this._canvas.height = this._crop._height = i.y), this._redraw()
    },
    _redraw: function() {
        var t, i, a, s, e, n, h, o, r, _ = [],
            d = this._crop._r,
            l = this._map.getSize(),
            m = new L.LatLngBounds(this._map.containerPointToLatLng(L.point([-d, -d])), this._map.containerPointToLatLng(l.add([d, d]))),
            c = void 0 === this.options.max ? 1 : this.options.max,
            u = void 0 === this.options.maxZoom ? this._map.getMaxZoom() : this.options.maxZoom,
            g = 1 / Math.pow(2, Math.max(0, Math.min(u - this._map.getZoom(), 12))),
            f = d / 2,
            p = [],
            v = this._map._getMapPanePos(),
            w = v.x % f,
            y = v.y % f;
        for (t = 0, i = this._latlngs.length; i > t; t++)
            if (m.contains(this._latlngs[t]) && this._latlngs[t][2] > 0) {
                a = this._map.latLngToContainerPoint(this._latlngs[t]), e = Math.floor((a.x - w) / f) + 2, n = Math.floor((a.y - y) / f) + 2;
                var x = void 0 !== this._latlngs[t].alt ? this._latlngs[t].alt : void 0 !== this._latlngs[t][2] ? +this._latlngs[t][2] : 1;
                r = x,
                p[n] = p[n] || [], s = p[n][e],
                    p[n][e] = [a.x, a.y, r]
            }
        for (t = 0, i = p.length; i > t; t++)
            if (p[t])
                for (h = 0, o = p[t].length; o > h; h++) s = p[t][h], s && _.push([Math.round(s[0]), Math.round(s[1]), s[2]]); //Math.min(s[2], c)]);
        this._crop.data(_).draw(this.options.minOpacity), this._frame = null
    },
    _animateZoom: function(t) {
        var i = this._map.getZoomScale(t.zoom),
            a = this._map._getCenterOffset(t.center)._multiplyBy(-i).subtract(this._map._getMapPanePos());
        L.DomUtil.setTransform ? L.DomUtil.setTransform(this._canvas, a, i) : this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(a) + " scale(" + i + ")"
    }
}), L.cropLayer = function(t, i) {
    return new L.CropLayer(t, i)
};
