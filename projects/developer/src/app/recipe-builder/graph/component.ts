import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';


@Component({
    selector: 'dev-recipe-builder-graph',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class RecipeBuilderGraphComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('svgArea') svgArea: ElementRef;

    // min zoom level
    readonly minZoom = 0.5;
    // max zoom level
    readonly maxZoom = 4;
    // step size for zoomIn(), zoomOut(), and slider
    readonly zoomStep = 0.1;
    // initial zoom value, applied initially in svg
    private zoomValue = 1.0;
    // zoom behavior controlling zooming functionality
    private zoomBehavior: d3.ZoomBehavior<Element, any>;
    // container to keep zoom area same size as window
    private zoomContainer: d3.Selection<SVGRectElement, any, SVGElement, any>;

    // margins within the svg
    private readonly margin = { top: 10, right: 10, bottom: 10, left: 10 };
    // keeps track of the last window resize event to prevent duplicate resizes
    private previousWindowDims = { width: 0, height: 0 };

    // main svg element
    private svg: d3.Selection<SVGElement, any, SVGElement, any>;
    // base container holding everything
    private baseContainer: d3.Selection<SVGGElement, any, SVGElement, any>;
    // primary container holding visible items
    private mainContainer: d3.Selection<SVGGElement, any, SVGElement, any>;


    /** Width of the parent element without margins (usable size). */
    get width(): number {
        const el = this.svgArea.nativeElement;
        const width = el.offsetWidth - this.margin.right - this.margin.left;
        return Math.max(width, 100);
    }

    /** Height of the SVG without margins (usable size). */
    get height(): number {
        const el = this.svgArea.nativeElement;
        const height = el.offsetHeight - this.margin.top - this.margin.bottom;
        return Math.max(height, 100);
    }

    /**
     * Creates the main SVG element and top-level components.
     */
    private createSvg(): void {
        // create svg object
        this.svg = d3.select(this.svgArea.nativeElement).append('svg');

        // create zoom behavior
        this.zoomBehavior = d3.zoom()
            .scaleExtent([this.minZoom, this.maxZoom])
            .on('zoom', () => { this.onZoom.call(this); });

        // base container
        this.baseContainer = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.right})`)
            .call(this.zoomBehavior);

        this.zoomContainer = this.baseContainer.append('rect')
            .style('fill', 'none')
            .style('pointer-events', 'all');

        // create main container
        this.mainContainer = this.baseContainer.append('g');

        // TODO remove
        this.mainContainer
            .append('circle')
            .attr('cx', 300)
            .attr('cy', 300)
            .attr('r', 40)
            .style('fill', '#68b2a1');
    }

    /**
     * Event handler when the window resizes, toggles the resize hook.
     * @param event window resize event
     */
    @HostListener('window:resize', ['$event'])
    onWindowResize(event: any): void {
        if (event.target.innerWidth === this.previousWindowDims.width &&
            event.target.innerHeight === this.previousWindowDims.height) {
            // dims are the same, don't perform a resize
            return;
        }

        // save the previous window width for next resize event
        this.previousWindowDims.width = event.target.innerWidth;
        this.previousWindowDims.height = event.target.innerHeight;

        this.resize();
    }

    /**
     * Full hook to perform all resize actions.
     */
    public resize(): void {
        this.resizeSvg();
    }

    /**
     * Resizes the SVG element and top-level components.
     */
    private resizeSvg(): void {
        // let the browser resize the parent element first
        this.svg
            .attr('height', 1)
            .attr('width', 1);

        // resize the svg, using the parent element size as the reference point
        this.svg
            .attr('width', this.width + this.margin.right + this.margin.left)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        // resize hidden zoom container
        this.zoomContainer
            .attr('width', this.width)
            .attr('height', this.height);
    }

    /** Current zoom level. */
    get zoomLevel(): number {
        return this.zoomValue;
    }

    /** Set the zoom level by scaling the main container. */
    set zoomLevel(value: number) {
        // onZoom will set this.zoomValue
        this.zoomBehavior.scaleTo(this.baseContainer, value);
    }

    /**
     * Callback for when zoom event happens.
     */
    private onZoom(): void {
        const currentTransform = d3.event.transform;

        // save the zoom level and update the transform
        this.zoomValue = currentTransform.k;
        this.mainContainer.attr('transform', currentTransform);
    }

    /**
     * Zoom in by the magnitude amount, if any.
     * @param magnitude optional magnitude to zoom in by, defauling to zoom step
     */
    public zoomIn(magnitude?: number): void {
        this.zoomLevel += magnitude || this.zoomStep;
    }

    /**
     * Zoom out by the magnitude amount, if any.
     * @param magnitude optional magnitude to zoom out by, defauling to zoom step
     */
    public zoomOut(magnitude?: number): void {
        this.zoomLevel -= magnitude || this.zoomStep;
    }

    constructor() {
        // TODO remove this
        (<any>window).recipeBuilder = this;
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    ngAfterViewInit() {
        this.createSvg();

        setTimeout(() => {
            this.resize();
        }, 300);
    }
}
