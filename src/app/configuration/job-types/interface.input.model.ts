export class InterfaceInput {
    constructor(
        public name: string,
        public type: string,
        public required?: boolean,
        public partial?: boolean,
        public media_types?: string[]
    ) {
        this.name = this.name || null;
        this.type = this.type || null;
        this.required = this.required || null;
        this.partial = this.partial || null;
        this.media_types = this.media_types || null;
    }
}
