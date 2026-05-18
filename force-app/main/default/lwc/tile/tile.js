import { LightningElement, api } from 'lwc';

export default class Tile extends LightningElement {
    @api product;

    tileClick(event) {
        event.stopPropagation();
        const eventDetail = new CustomEvent('tileclick', {
            // detail contains only primitives
            detail: this.product.Id
        });
        // Fire the event from c-tile
        this.dispatchEvent(eventDetail);
    }
}
