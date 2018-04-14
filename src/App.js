import React, { Component } from 'react';
// import Graph from './components/Graph';
// import Manipulation from './components/Manipulation';
import DrawSpace from "./components/DrawSpace";
// import Panel from "./components/Panel";

import './index.css';

class App extends Component {
    constructor() {
        super();

        this.state = {
            id: 0,
            weight: null,
            nodes: []
        };

        this.handleChangeId = this.handleChangeId.bind(this);
        this.handleChangeWeight = this.handleChangeWeight.bind(this);
        this.handleCreateNode = this.handleCreateNode.bind(this);
        this.resetInputs = this.resetInputs.bind(this);
        this.updateNodes = this.updateNodes.bind(this);

        this.updateNode = this.updateNode.bind(this);
        this.deleteNode = this.deleteNode.bind(this);
    }

    handleChangeId(e) {
        this.setState({
            id: e.target.value
        });
    }

    handleChangeWeight(e) {
        this.setState({
            weight: e.target.value
        });
    }

    handleCreateNode() {
        this.setState({
            nodes: [...this.state.nodes, {
                id: this.state.id++,
                label: this.state.weight
            }]
        }, () => {
            // console.log("App", this.state.nodes);
            this.resetInputs()
        });
    }

    resetInputs() {
        this.setState({
            weight: null
        });

        this.inputNodeWeight.value = "";
    }

    updateNode(node, callback) {
        let updatedNode = {
            id: node.id,
            label: node.label
        };

        let nodes = this.state.nodes.filter( function( obj ) {
            return obj.id !== node.id;
        });

        let updatedNodes = [...nodes, updatedNode].sort( (a,b) => {
            const aId = a.id;
            const bId = b.id;

            return aId - bId
        });

        this.setState({
            nodes: updatedNodes
        }, () => callback() );
    }

    updateNodes(data) {
        const nodes = Object.keys(data).map((key) => {
            console.log("Update node", data[key]);
            return data[key]
        });
    }

    deleteNode(nodeId) {
        const updatedNodes = this.state.nodes.filter( function( obj ) {
            return obj.id !== nodeId;
        });

        this.setState({
            nodes: updatedNodes
        });
    }

    render() {
        return (
          <div className="App">
              <DrawSpace
                nodes={this.state.nodes}
                updateNode={this.updateNode}
                deleteNode={this.deleteNode}
                updateNodes={this.updateNodes}
              />
              <div className="form-control add-node-form">
                  <label htmlFor="node-weigth" className="form-title">Add Node {this.state.id}</label>
                  <div className="row">
                      <input
                        className="input"
                        ref={ref => this.inputNodeWeight = ref}
                        id="node-weight"
                        placeholder="Type weight"
                        onChange={(e) => this.handleChangeWeight(e)}
                      />
                      <button
                        className="btn"
                        type="submit"
                        onClick={this.handleCreateNode}
                      >
                          Create Node
                      </button>
                  </div>
              </div>

              <div className="form-control add-edge-form">
                  <label htmlFor="edge-weigth" className="form-title">Add Edge</label>
                  <div className="row">
                      <input
                        className="input"
                        ref={ref => this.inputEdgeWeight = ref}
                        id="edge-weight"
                        placeholder="Type weight"
                        // onChange={(e) => this.handleChangeEdgeWeight(e)}
                      />
                      <button
                        className="btn"
                        type="submit"
                        onClick={this.handleCreateNode}
                      >
                          Create Node
                      </button>
                  </div>
              </div>
          </div>
        );
    }
}

export default App;
