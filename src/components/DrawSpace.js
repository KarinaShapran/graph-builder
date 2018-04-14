import React, { Component } from 'react';

import vis from 'vis/dist/vis';
import 'vis/dist/vis.css';

// const edges = new vis.DataSet([
//     {from: 1, to: 3},
//     {from: 1, to: 2},
//     {from: 2, to: 4},
//     {from: 2, to: 5}
// ]);
const data = new vis.DataSet();

export default class DrawSpace extends Component {
    constructor() {
        super();

        this.state = {
            //Edge label
            label: "",
            //Edge ID
            id: 0,
            edges: [],

            nodeForUpdate: {
                id: "",
                label: ""
            },

            isActiveNodeUpdateForm: false,
            isActiveAddEdgeForm: false
        };

        this.drawGraph = this.drawGraph.bind(this);

        this.renderUpdateNodeForm = this.renderUpdateNodeForm.bind(this);
        this.renderAddEdgeForm = this.renderAddEdgeForm.bind(this);

        this.onCloseModal = this.onCloseModal.bind(this);
        this.onCloseAddEdgeModal = this.onCloseAddEdgeModal.bind(this);

        this.handleCreateEdge = this.handleCreateEdge.bind(this);
    }

    componentDidMount() {
        this.drawGraph(this.props.nodes, this.state.edges);
    }

    componentDidUpdate(prevProps) {
        //TODO add for update edges
        if (prevProps.nodes !== this.props.nodes) {
            this.drawGraph(this.props.nodes, this.state.edges);
        }
    }

    drawGraph(nodes, edges) {
        const self = this;

        const options = {
            locale: 'ru',
            autoResize: false,
            height: '100%',
            width: '100%',
            nodes: {
                shape: 'ellipse'
            },
            edges:{
                arrows: {
                    to:     {enabled: true, scaleFactor:1, type:'arrow'},
                    from:   {enabled: false, scaleFactor:1, type:'arrow'}
                },
                font: {
                    color: '#343434',
                    size: 14
                }
            },
            manipulation: {
                addNode: false,

                // Editing Node
                editNode: function (data, callback) {
                    self.renderUpdateNodeForm(data, () =>
                      document.getElementById('update-node-btn').onclick = () => {
                        self._saveData(data, self.inputUpdate, callback);
                        self.props.updateNode(data, self.onCloseModal);
                        }
                    );
                  },

                //Adding Edge
                addEdge: function (edgeData, callback) {
                      if (edgeData.from === edgeData.to) {
                          const r = window.confirm("Do you want to connect the node to itself?");
                          if (r !== true) {
                              callback(null);
                              return;
                          }
                      }
                      self.renderAddEdgeForm(edgeData, () => {
                          // self.saveEdge(edgeData)
                          document.getElementById('add-edge').onclick = () => {
                              self.handleCreateEdge(edgeData, self.onCloseAddEdgeModal, callback);
                          }

                      });
                  },

                //Editing Edge
                editEdge: function (edgeData, callback) {
                    callback(edgeData);
                },

                //Deleting Node
                deleteNode: function (data, callback) {
                    self.props.deleteNode(data.nodes[0]);
                    callback(data);
                },
                deleteEdge: true
            },
        };

        const data = { nodes: nodes, edges: edges };
        const container = document.getElementById('mynetwork');
        const network = new vis.Network(container, data, options);

        this.props.updateNodes(network.body.data.nodes._data);
    }

    onCloseModal() {
        this.setState({
            isActiveNodeUpdateForm: !this.state.isActiveNodeUpdateForm
        });
        this.inputUpdate.value = "";
    }

    onCloseAddEdgeModal() {
        this.setState({
            isActiveAddEdgeForm: !this.state.isActiveAddEdgeForm,
            label: null
        });
        this.inputEdgeWeight.value = "";
    }

    _saveData(data, ref, callback) {
        data.label = ref.value;
        callback(data);
    }

    renderUpdateNodeForm(node, callback) {
        this.setState({
            isActiveNodeUpdateForm: !this.state.isActiveNodeUpdateForm,
            nodeForUpdate: {
                id: node.id,
                label: node.label
            }
        }, () => callback());
    }

    renderAddEdgeForm(edge, callback) {
        this.setState({
            isActiveAddEdgeForm: !this.state.isActiveAddEdgeForm
        }, () => callback());
    }

    handleChangeEdgeWeight(e) {
        this.setState({
            label: e.target.value
        });
    }

    handleCreateEdge(data, callback, defaulCallback) {
        data.label = this.state.label;

        this.setState({
            edges: [...this.state.edges, {
                id: this.state.id++,
                label: this.state.label,
                from: data.from,
                to: data.to
            }]
        }, () => { callback(); defaulCallback(data) } );
    }

    render() {
        return (
          <div className="workspace-wrapper">
              {
                this.state.isActiveNodeUpdateForm
                  ? <div className="form-control update-form">
                      <span className="form-title">Update Node {this.state.nodeForUpdate.id}</span>

                      <div className="row">
                          <input
                            id="label"
                            className="input"
                            ref={ref => this.inputUpdate = ref}
                            placeholder="Type weight"
                          />
                          <button
                            id="update-node-btn"
                            className="btn purple"
                            type="submit"
                          >
                              Update Node
                          </button>
                      </div>
                    </div>
                  : null
              }

              {
                  this.state.isActiveAddEdgeForm
                    ? <div className="form-control add-edge-form">
                        <label htmlFor="edge-weigth" className="form-title">Add Edge {this.state.id}</label>
                        <div className="row">
                            <input
                              className="input"
                              ref={ref => this.inputEdgeWeight = ref}
                              id="edge-weight"
                              placeholder="Type weight"
                              onChange={(e) => this.handleChangeEdgeWeight(e)}
                            />
                            <button
                              id="add-edge"
                              className="btn"
                              type="submit"
                            >
                                Create Edge
                            </button>
                        </div>
                    </div>
                    : null
              }

              <div id="mynetwork"></div>
          </div>
        );
    }
}