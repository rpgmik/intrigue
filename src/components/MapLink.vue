<template>
  <div>
    <l-polygon
      v-if="show"
      :lat-lngs="latlngs"
      :color="link.color"
      :weight="link.linkThickness * 5"
      @click="onClick"
    ></l-polygon>
    <l-marker :lat-lng="midpoint" v-if="show && text !== ''" :zIndexOffset="1500" @click="onClick">
      <l-icon :icon-anchor="[label.length*4.5, 13]">
        <div class="line-label-div">
          <span class="line-label-span" :style="'background-color:'+link.color">{{ text }}</span>
        </div>
      </l-icon>
    </l-marker>
  </div>
</template>

<script>
import { LPolygon, LIcon, LMarker } from "vue2-leaflet";
import { proxy } from "../utils/Proxy";
import { mapGetters } from "vuex";

// Below latlng midpoint functions was borrowed from
// http://jsfiddle.net/kevinrignault/gzq64p56/
if (typeof Number.prototype.toRad === "undefined") {
  Number.prototype.toRad = function() {
    return (this * Math.PI) / 180;
  };
}

if (typeof Number.prototype.toDeg === "undefined") {
  Number.prototype.toDeg = function() {
    return this * (180 / Math.PI);
  };
}

function middlePoint(lat1, lng1, lat2, lng2) {
  let dLng = (lng2 - lng1).toRad();

  lat1 = lat1.toRad();
  lat2 = lat2.toRad();
  lng1 = lng1.toRad();

  let bX = Math.cos(lat2) * Math.cos(dLng);
  let bY = Math.cos(lat2) * Math.sin(dLng);
  let lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY)
  );
  let lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);

  return {
    lat: lat3.toDeg(),
    lng: lng3.toDeg()
  };
}

export default {
  components: {
    LMarker,
    LPolygon,
    LMarker,
    LIcon
  },
  props: ["link", "p1", "p2", "label"],
  data() {
    return {};
  },
  methods: {
    proxy,
    onClick() {
      if (!this.show) {
        return;
      }
      if (
        !this.isShowAllLinkLabelsEnabled &&
        !(
          this.$root.Map.selectedHub === this.link.hubA ||
          this.$root.Map.selectedHub === this.link.hubB
        )
      ) {
        return;
      }
      this.$emit("click:link", this.link);
    }
  },
  computed: {
    ...mapGetters({
      hasFiles: "google/hasFiles",
      isEmpty: "session/isEmpty",
      isDarkThemeEnabled: "preferences/isDarkThemeEnabled",
      isDefaultAutoSyncEnabled: "preferences/isDefaultAutoSyncEnabled",
      isShowAllLinkLabelsEnabled: "preferences/isShowAllLinkLabelsEnabled",
      isKultStyleEnabled: "preferences/isKultStyleEnabled"
    }),
    midpoint() {
      if (!this.show) {
        return { lat: 0, lng: 0 };
      }
      let l = this.latlngs;
      return middlePoint(l[0].lat, l[0].lng, l[1].lat, l[1].lng);
    },
    latlngs() {
      if (!this.show) {
        return [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }];
      }
      return [this.p1, this.p2];
    },
    show() {
      if (typeof this.p1 === "undefined" || this.p1 === null) {
        return false;
      } else if (typeof this.p2 === "undefined" || this.p2 === null) {
        return false;
      }
      return true;
    },
    text() {
      if (!this.show) {
        return "";
      }
      if (
        !this.isShowAllLinkLabelsEnabled &&
        !(
          this.$root.Map.selectedHub === this.link.hubA ||
          this.$root.Map.selectedHub === this.link.hubB
        )
      ) {
        return "";
      }
      return this.label;
    }
  }
};
</script>
<style scoped>
.cursor-image {
  width: 100px;
  height: 100px;
}

.line-label-span {
  font-size: 1.4em;
  padding: 0.2em;
  padding-left: 0.5em;
  padding-right: 0.5em;
  white-space: nowrap;
  text-align: center;
}

.line-label-div:first-letter {
  text-transform: uppercase;
}
</style>
