import React, { Component } from 'react';


export default class GenerationForm extends Component {

    constructor() {
        super();

        this.state = {
            nodes: [],
            edges: [],

            minNodeWeight: "",
            maxNodeWeight: "",
            nodesNumber: "",
            connectivity: "",
            minEdgeWeight: "",
            maxEdgeWeight: "",
            message: ""
        };
        this.handleChangeNodesNumber = this.handleChangeNodesNumber.bind(this);
        this.handleChangeMinNodeWeight = this.handleChangeMinNodeWeight.bind(this);
        this.handleChangeMaxNodeWeight = this.handleChangeMaxNodeWeight.bind(this);
        this.handleChangeConnectivity = this.handleChangeConnectivity.bind(this);
        this.handleChangeMinEdgeWeight = this.handleChangeMinEdgeWeight.bind(this);
        this.handleChangeMaxEdgeWeight = this.handleChangeMaxEdgeWeight.bind(this);

        this.validateMinMax = this.validateMinMax.bind(this);
        this.generateGraph = this.generateGraph.bind(this);
        this.generateNodes = this.generateNodes.bind(this);
    }

    handleChangeNodesNumber(e) {
        this.setState({
            nodesNumber: e.target.value,
            message: ""
        });
    }

    handleChangeMinNodeWeight(e) {
        this.setState({
            minNodeWeight: e.target.value,
            message: ""
        });
    }

    handleChangeMaxNodeWeight(e) {
        this.setState({
            maxNodeWeight: e.target.value,
            message: ""
        });
    }

    handleChangeConnectivity(e) {
        this.setState({
            connectivity: e.target.value,
            message: ""
        });
    }

    handleChangeMinEdgeWeight(e) {
        this.setState({
            minEdgeWeight: e.target.value,
            message: ""
        });
    }

    handleChangeMaxEdgeWeight(e) {
        this.setState({
            maxEdgeWeight: e.target.value,
            message: ""
        });
    }

    validateMinMax() {
        const {minNodeWeight, maxNodeWeight} = this.state;

        if (parseInt(minNodeWeight, 10) > parseInt(maxNodeWeight, 10)) {
            this.setState({message: "MIN node weight need to be less than MAX node weight"});
            return false;
        } else {
            return true;
        }
    }

    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
    }

    generateNodes() {
        if (this.validateMinMax()) {
            const {nodesNumber, minNodeWeight, maxNodeWeight} = this.state;
            let numberOfNodes = nodesNumber;
            let nodesArr = [];
            let id = 0;

            while (numberOfNodes) {
                const weight = this.getRandomIntInclusive(parseInt(minNodeWeight, 10), parseInt(maxNodeWeight, 10));
                console.log(weight);
                const node = {
                    id: id,
                    label: weight,
                    title: id
                };
                nodesArr.push(node);
                id++;
                numberOfNodes--;
            }

            this.setState({nodes: nodesArr});
        }
    }

    generateGraph() {

    }

    render() {
        const {message} = this.state;

        return (
          <div className="form-control generate-form">
              <div className="row">
                  <label htmlFor="num-nodes" className="label-control">Nodes number</label>
                  <input
                    className="input green input-control"
                    id="num-nodes"
                    ref={ref => this.nodesNumber = ref}
                    onChange={this.handleChangeNodesNumber}
                  />
              </div>
              <div className="row">
                  <label htmlFor="min-node-weight" className="label-control">MIN node weight</label>
                  <input
                    className="input green input-control"
                    id="min-node-weight"
                    ref={ref => this.minNodeWeight = ref}
                    onChange={this.handleChangeMinNodeWeight}
                  />
              </div>
              <div className="row">
                  <label htmlFor="max-node-weight" className="label-control">MAX node weight</label>
                  <input
                    className="input green input-control"
                    id="max-node-weight"
                    ref={ref => this.maxNodeWeight = ref}
                    onChange={this.handleChangeMaxNodeWeight}
                  />
              </div>
              <div className="row">
                  <label htmlFor="connectivity" className="label-control">Connectivity, %</label>
                  <input
                    className="input green input-control"
                    id="connectivity"
                    ref={ref => this.connectivity = ref}
                    onChange={this.handleChangeConnectivity}
                  />
              </div>
              <div className="row">
                  <label htmlFor="min-edge-weight" className="label-control">MIN edge weight</label>
                  <input
                    className="input green input-control"
                    id="min-edge-weight"
                    ref={ref => this.minEdgeWeight = ref}
                    onChange={this.handleChangeMinEdgeWeight}
                  />
              </div>
              <div className="row">
                  <label htmlFor="max-edge-weight" className="label-control">MAX edge weight</label>
                  <input
                    className="input green input-control"
                    id="max-edge-weight"
                    ref={ref => this.maxEdgeWeight = ref}
                    onChange={this.handleChangeMaxEdgeWeight}
                  />
              </div>
              <div className="row">
                  <span className="messages">{message ? message : ""}</span>
              </div>
              <button
                id="generate-btn"
                className="btn green"
                type="submit"
                onClick={this.generateNodes}
              >
                  Generate
              </button>
          </div>
        )
    }
}