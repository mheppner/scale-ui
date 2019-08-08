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

    // tooltip element
    private tooltip: d3.Selection<Element, any, HTMLElement, any>;


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
        // create tooltip
        this.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'rgba(0, 0, 0, 0.7)')
            .style('color', '#eee')
            .style('padding', '2px')
            .style('border-radius', '2px')
            .style('font-size', '0.9em')
            .style('text-align', 'center')
            .style('max-width', '80px');

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

        this.drawJob();
    }

    /**
     * Draws a job node.
     */
    private drawJob(): void {
        // TODO data
        const jobName = 'Job 1';
        const inputs = [
            { id: 1, name: 'file1' },
            { id: 2, name: 'file2' }
        ];
        const outputs = [
            { id: 1, name: 'output1' },
            { id: 2, name: 'output2' },
            { id: 3, name: 'output3' },
            { id: 4, name: 'output4' }
        ];

        // radius of an input/output handle
        const ioRadius = 5;
        // width between input/output handles
        const ioSpacerWidth = ioRadius * 1.7;

        // add a group for this job
        const group = this.mainContainer
            .append('g')
            .attr('class', 'node job');

        // height of the box
        const height = 36;
        // max number of input/output nodes
        const maxNumConn = Math.max(inputs.length, outputs.length);
        // total width of the box, including spacers and nodes
        // (spacerWidth * (num + 1)) + (ioDiameter * num)
        const totalWidth = (ioSpacerWidth * (maxNumConn + 1)) + (ioRadius * 2 * maxNumConn);

        // rectangle for main body
        group
            .append('rect')
            .attr('class', 'body')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', totalWidth)
            .attr('height', height);

        // label for body
        group
            .append('text')
            .text(jobName)
            .attr('x', totalWidth / 2)
            .attr('y', height / 2);

        /**
         * Draws either input or output node handlers.
         * @param  data      array-like data to attach to the io node
         * @param  yPos      the offset of where these nodes should be drawn
         * @param  cssClass  the css class for these nodes
         * @return           the shapes that were drawn
         */
        const drawIONodes = (data: any, yPos: number, cssClass: string): d3.Selection<d3.BaseType, any, SVGGElement, any> => {
            const shapes = group.selectAll(`.${cssClass}`)
                .data(data, d => d['id']);
            shapes.enter().append('circle')
                .attr('r', ioRadius)
                .attr('cx', (d, idx, allData) => {
                    // total of all spacer between io nodes
                    // spacerWidth + n(2 * r)
                    const spacerWidth = (ioSpacerWidth + (2 * ioRadius)) * idx;
                    // x position of this node
                    const xPos = spacerWidth + (ioRadius + ioSpacerWidth);

                    // total width of all io nodes, spaces included
                    const inputsWidth = (ioSpacerWidth * (allData.length + 1)) + (2 * ioRadius * allData.length);
                    // offset to center all io nodes
                    const offset = (totalWidth - inputsWidth) / 2;
                    return xPos + offset;
                })
                .attr('cy', yPos)
                .attr('class', cssClass)
                .on('mouseover', d => {
                    this.tooltip.transition()
                        .duration(200)
                        .style('opacity', 0.9);
                    this.tooltip.html(d['name'])
                        .style('left', `${d3.event.pageX + ioRadius}px`)
                        .style('top', `${d3.event.pageY + ioRadius}px`);
                })
                .on('mouseout', d => {
                    this.tooltip.transition()
                        .duration(200)
                        .style('opacity', 0);
                });
            shapes.exit().remove();
            return shapes;
        };

        // draw input nodes
        drawIONodes(inputs, 0, 'input');

        // draw output nodes
        drawIONodes(outputs, height, 'output');
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
