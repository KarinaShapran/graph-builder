import React, { Component } from 'react';
import Graph from 'graph.js';

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

            nodesWeightSum: null,
            edgesWeightSum: null,

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
        this.getNeededEdgesWeightSum = this.getNeededEdgesWeightSum.bind(this);

        this.resetSums = this.resetSums.bind(this);
        this.generateEdges = this.generateEdges.bind(this);
        this.isCycles = this.isCycles.bind(this);
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

    validateMinMax(min, max) {
        if (parseInt(min, 10) > parseInt(max, 10)) {
            this.setState({message: "MIN weight need to be less than MAX weight"});
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

    generateNodes(callback) {
        const {nodesNumber, minNodeWeight, maxNodeWeight, nodesWeightSum} = this.state;

        if (this.validateMinMax(minNodeWeight, maxNodeWeight)) {

            let numberOfNodes = nodesNumber;
            let nodesSum = nodesWeightSum;

            let nodesArr = [];
            let id = 0;

            while (numberOfNodes) {
                const weight = this.getRandomIntInclusive(parseInt(minNodeWeight, 10), parseInt(maxNodeWeight, 10));
                const node = {
                    id: id,
                    label: weight,
                    title: id
                };
                nodesSum += parseInt(weight, 10);
                nodesArr.push(node);
                id++;
                numberOfNodes--;
            }
            console.log("Nodes sum", nodesSum);

            this.setState({nodes: nodesArr, nodesWeightSum: nodesSum}, () => callback());
        }
    }

    getNeededEdgesWeightSum(callback) {
        const {minEdgeWeight, maxEdgeWeight, connectivity, nodesWeightSum} = this.state;
        let edgesSum = null;
        let correlation = parseInt(connectivity, 10) / 100;

        if (this.validateMinMax(minEdgeWeight, maxEdgeWeight)) {
            edgesSum = Math.round(nodesWeightSum / correlation - nodesWeightSum);
            this.setState({edgesWeightSum: edgesSum}, () => callback());
        }
    }

    resetSums(callback) {
        this.setState({
            nodesWeightSum: null,
            edgesWeightSum: null
        }, () => callback());
    }

    isCycles() {
        const {nodes, edges} = this.state;
        const graph = new Graph();

        nodes.forEach(node => graph.addNewVertex(node.id));
        edges.forEach(edge => graph.createNewEdge(edge.from, edge.to));

        return graph.cycles();
    }

    generateEdges(callback) {
        const {edgesWeightSum, nodes, edges, minEdgeWeight, maxEdgeWeight, connectivity} = this.state;
        let realEdgesWeightSum = 0;
        let edgesArr = [];
        let id = 0;

        //For cycle checking
        let graph = new Graph();
        graph.clear();
        nodes.forEach(node => graph.addNewVertex(node.id));

        //If correlation is 99-100%
        //There will be no edges
        if (edgesWeightSum === 0) {
            this.setState({edges: []}, () => callback());
        } else {
            const t0 = performance.now();
            let startLoopTime = Date.now();

            while (realEdgesWeightSum !== edgesWeightSum) {
                let insideLoopTime = Date.now();
                if (insideLoopTime - startLoopTime > 4000) {
                    break;
                }

                let indexFrom = this.getRandomIntInclusive(0, nodes.length - 1);
                let indexTo = this.getRandomIntInclusive(0, nodes.length - 1);

                // console.log("from: ", indexFrom, "; to: ", indexTo);

                if (indexFrom !== indexTo &&
                  !edgesArr.find(edge => (
                    (edge.from === indexFrom && edge.to === indexTo) ||
                    (edge.from === indexTo && edge.to === indexFrom)
                  ))
                ) {
                    let weight = this.getRandomIntInclusive(minEdgeWeight, maxEdgeWeight);
                    if (realEdgesWeightSum + weight > edgesWeightSum) {
                        realEdgesWeightSum = 0;
                        edgesArr = [];
                        id = 0;
                        graph.clearEdges();
                        continue;
                    } else {
                        //Cycles checking
                        graph.createNewEdge(indexFrom, indexTo);
                        const cycles = graph.cycles();

                        let cyclesArr = [];
                        for (let cycle of cycles) {
                            cyclesArr.push(cycle);
                        }

                        if (cyclesArr.length > 0) {
                            graph.removeEdge(indexFrom, indexTo);
                            continue;
                        } else {
                            const edge = {
                                id: id,
                                label: weight.toString(),
                                from: indexFrom,
                                to: indexTo
                            };
                            edgesArr.push(edge);
                            realEdgesWeightSum += weight;
                            id++;
                        }
                    }

                } else if ( parseInt(connectivity, 10) < 30 && edgesArr.find(edge => (
                    (edge.from === indexFrom && edge.to === indexTo) ||
                    (edge.from === indexTo && edge.to === indexFrom)
                  ))
                ) {
                    let weight = this.getRandomIntInclusive(minEdgeWeight, maxEdgeWeight);
                    let edgeOld = edgesArr.find(edge => (edge.from === indexFrom && edge.to === indexTo) ||
                      (edge.from === indexTo && edge.to === indexFrom));

                    let newWeight = weight + parseInt(edgeOld.label, 10);

                    const newArr = edgesArr.map(obj => {
                        if (obj.id === edgeOld.id) {
                            return {...obj, label: newWeight.toString()};
                        } else {
                            return obj;
                        }
                    });
                    edgesArr = [...newArr];
                    realEdgesWeightSum += weight;

                    if (realEdgesWeightSum > edgesWeightSum) {
                        realEdgesWeightSum = 0;
                        edgesArr = [];
                        id = 0;
                        graph.clearEdges();
                        continue;
                    } else {
                        continue;
                    }
                } else {
                    continue;
                }
            }

            const t1 = performance.now();
            console.log("Call to do something took " + (t1 - t0) + " milliseconds.");

            this.setState({edges: edgesArr}, () => callback());
            console.log("Real edge sum: ", realEdgesWeightSum, "Theor edge sum: ", edgesWeightSum);
        }
    }

    correction() {

    }
    generateGraph() {
        this.props.resetGraph(() =>
          this.resetSums(() => {
              this.generateNodes(() => {
                  this.getNeededEdgesWeightSum(() => {
                      this.generateEdges(() => {
                          if (this.state.edgesWeightSum !== 0) {
                              this.props.setNodes(this.state.nodes);
                              this.props.setEdges(this.state.edges);
                          } else {
                              this.props.setNodes(this.state.nodes);
                          }
                      });
                  });
              });
          })
        );
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
                onClick={this.generateGraph}
              >
                  Generate
              </button>
          </div>
        )
    }
}