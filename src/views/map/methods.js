import { Hub, HubTypes } from "../../models/Hub"
import { Link, LinkTypes } from "../../models/Link"
import { WasProxyActiveRecently, proxy } from "../../utils/Proxy"

import { Copy } from "../../utils/Entity"

import Vue from "vue";

export default {
    proxy,
    onMarkerDragComplete(hub, event) {
        this.hideCursor();
        this.$store.dispatch("session/hub", {
            id: hub.id,
            lat: event.lat,
            lng: event.lng
        });
    },
    async onAddLink() {
        let link = new Link();
        link.hubA = this.selectedHubA;
        link.hubB = this.selectedHubB;
        this.hideCursor();
        let linkType = await this.$root.LinkTypeSelector.open(link);
        if (linkType === null) {
            return;
        }
        link.ApplyLinkType(linkType);
        this.$store.dispatch(link);
        this.hideCursor();
        this.selectedHubB = null;
        this.showHubSpeedDial = 1;
    },
    async onAddOrganization(event) {
        this.hideCursor();
        let hub = new Hub({
            lat: this.cursorPosition.lat,
            lng: this.cursorPosition.lng
        });
        hub.hubType = await this.$root.SubTypeSelector.open(
            "Group",
            HubTypes["Group"]
        );
        this.$store.dispatch(hub);
    },
    async onAddPlace() {
        this.hideCursor();
        let hub = new Hub({
            lat: this.cursorPosition.lat,
            lng: this.cursorPosition.lng
        });
        hub.hubType = await this.$root.SubTypeSelector.open(
            "Place",
            HubTypes["Place"]
        );
        this.$store.dispatch(hub);
    },
    async onAddEvent() {
        this.hideCursor();
        let hub = new Hub({
            lat: this.cursorPosition.lat,
            lng: this.cursorPosition.lng
        });
        hub.hubType = await this.$root.SubTypeSelector.open(
            "Event",
            HubTypes["Event"]
        );
        this.$store.dispatch(hub);
    },
    async onAddCharacter(event) {
        this.hideCursor();
        let hub = new Hub({
            lat: this.cursorPosition.lat,
            lng: this.cursorPosition.lng
        });
        hub.hubType = await this.$root.SubTypeSelector.open(
            "Character",
            HubTypes["Character"]
        );
        let changes = await this.$root.AvatarDesigner.open(hub.avatar);
        Copy(hub.avatar, changes, Object.keys(changes));
        this.$store.dispatch(hub);
    },
    hideCursor() {
        this.lastCursorClickPosition.lat = null;
        this.lastCursorClickPosition.lng = null;
        this.showCursor = false;
        this.cursorLastHidden = new Date();
        Vue.nextTick(() => {
            this.lastCursorClickPosition.lat = null;
            this.lastCursorClickPosition.lng = null;
            this.showCursor = false;
            this.cursorLastHidden = new Date();
        });
    },
    async onEditHub() {
        this.hideCursor();
        let hub = await this.$root.HubEdit.open(this.selectedHubA);
        if (hub === null) { // Cancel
            return;
        }
        this.$store.dispatch(hub);
    },
    onDeleteHub(hub) {
        this.hideCursor();
        this.showHubSpeedDial = 2;
    },
    onConfirmDeleteHub(hub) {
        this.hideCursor();
        this.$store.dispatch("session/deleteHub", this.selectedHubA);
        this.abortHub();
    },
    abortHub() {
        this.hideCursor();
        this.showHubSpeedDial = 1;
        this.selectedHubA = null;
        this.selectedHubB = null;
    },
    async onHubClick(hub) {
        this.hideCursor();
        this.showHubSpeedDial = 1;
        if (this.selectedHubA === hub) {
            if (this.selectedHubB !== null) {
                this.selectedHubB = null;
            } else {
                this.selectedHubA = null;
            }
        } else if (this.selectedHubA !== null) {
            if (this.selectedHubB === hub) {
                this.selectedHubB = null;
                this.showHubSpeedDial = 1;
            } else {
                this.selectedHubB = hub;
                this.showHubSpeedDial = 3;
            }
        } else {
            this.selectedHubA = hub;
        }
    },
    // This part below is to deal with click and touch events not fireing correctly when inside a leaflet component
    onSetCursorCoordinate(event) {
        this.mapLastMouseDown = new Date();
        this.lastCursorClickPosition = event.latlng;
        this.onMap({ type: "mouseup" });
    },
    onMap(event) {
        switch (event.type) {
            case "touchstart":
            case "mousedown":
                this.mapLastMouseDown = new Date();
                break;
            case "touchend":
            case "mouseup":
                if (
                    this.lastCursorClickPosition.lat === null ||
                    this.lastCursorClickPosition.lng === null ||
                    new Date().getTime() - this.mapLastMouseDown.getTime() > 500 ||
                    new Date().getTime() - this.cursorLastHidden.getTime() < 500
                ) {
                    return; // Don't do any actions if no new coordinates has been set (this due to problems with button interaction on the map)
                }
                this.showCursor = false;
                setTimeout(() => {
                    this.cursorPosition.lat = this.lastCursorClickPosition.lat;
                    this.cursorPosition.lng = this.lastCursorClickPosition.lng;
                    this.lastCursorClickPosition.lat = null;
                    this.lastCursorClickPosition.lng = null;
                    this.showCursor = true;
                }, 20);
                break;
        }
    },
    onCursorClick() {
        Vue.nextTick(() => {
            this.hideCursor();
        });
    }
};