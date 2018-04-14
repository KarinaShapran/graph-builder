import React, { Component } from 'react';

import vis from 'vis/dist/vis';
import 'vis/dist/vis.css';

export default class Panel extends Component {
    constructor() {
        super();

        this.network = null;
        this.nodes = [];
        this.edges = [];
    }

    componentDidMount(){
        this.draw();
    }

    destroy() {
        if (this.network !== null) {
            this.network.destroy();
            this.network = null;
        }
    }

    draw() {
        this.nodes = new vis.DataSet([
            {id: 1, label: 'Node 1'},
            {id: 2, label: 'Node 2'},
            {id: 3, label: 'Node 3'},
            {id: 4, label: 'Node 4'},
            {id: 5, label: 'Node 5'}
        ]);

        this.edges = new vis.DataSet([
            {from: 1, to: 3},
            {from: 1, to: 2},
            {from: 2, to: 4},
            {from: 2, to: 5}
        ]);

        var data = {
            nodes: this.nodes,
            edges: this.edges
        };

        // create a network
        var container = document.getElementById('mynetwork');
        var options = {

            physics: false,
            manipulation: {
                addNode: function (data, callback) {
                    // filling in the node popup DOM elements
                    document.getElementById('node-operation').innerHTML = "Node hinzufügen";
                    data.id = "node_" + Math.random().toString(36).replace(/[^a-zA-Z0-9]+/g, '').substr(1, 7);
                    document.getElementById('node-label').value = "Label";
                    document.getElementById('node-title').value = "Tootltip";
                    document.getElementById('node-file').value = "Name der korrespondierenden Datei";
                    document.getElementById('saveNodeButton').onclick = this.saveNode(data, callback);
                    document.getElementById('cancelNodeButton').onclick = this.clearNodePopUp();
                    // document.getElementById('NodePopUp').style.display = 'block';
                },
                editNode: function (data, callback) {
                    // filling in the popup DOM elements
                    document.getElementById('node-operation').innerHTML = "Node bearbeiten";
                    document.getElementById('node-label').value = data.label;
                    document.getElementById('node-title').value = data.title;
                    document.getElementById('node-file').value = data.file;
                    document.getElementById('saveNodeButton').onclick = this.saveNode.bind(this, data, callback);
                    document.getElementById('cancelNodeButton').onclick = this.cancelNodeEdit.bind(this,callback);
                    // document.getElementById('NodePopUp').style.display = 'block';
                },
                addEdge: function (data, callback) {
                    // filling in the node popup DOM elements
                    document.getElementById('edge-operation').innerHTML = "Edge hinzufügen";
                    data.id = "edge_" + Math.random().toString(36).replace(/[^a-zA-Z0-9]+/g, '').substr(1, 7);
                    document.getElementById('edge-label').value = "Label";
                    document.getElementById('edge-title').value = "Tootltip";
                    document.getElementById('saveEdgeButton').onclick = this.saveEdge.bind(this, data, callback);
                    document.getElementById('cancelEdgeButton').onclick = this.clearEdgePopUp.bind();
                    // document.getElementById('EdgePopUp').style = {{display: 'block'};
                },
                editEdge: function (data, callback) {
                    // filling in the popup DOM elements
                    document.getElementById('edge-operation').innerHTML = "Edge bearbeiten";
                    document.getElementById('edge-label').value = data.label;
                    document.getElementById('edge-title').value = data.title;
                    document.getElementById('saveEdgeButton').onclick = this.saveEdge.bind(this, data, callback);
                    document.getElementById('cancelEdgeButton').onclick = this.cancelEdgeEdit.bind(this,callback);
                    // document.getElementById('EdgePopUp').style.display = 'block';
                }
            }
        };
        this.network = new vis.Network(container, data, options);
    }

    // NODES START
    clearNodePopUp() {
        document.getElementById('saveNodeButton').onclick = null;
        document.getElementById('cancelNodeButton').onclick = null;
        // document.getElementById('NodePopUp').style.display = 'none';
    }

    cancelNodeEdit(callback) {
        this.clearNodePopUp();
        callback(null);
    }

    saveNode(data,callback) {
        data.label = document.getElementById('node-label').value;
        data.title = document.getElementById('node-title').value;
        data.file = document.getElementById('node-file').value;

        var node_data_to_save = {
            id: data.id,
            x: data.x,
            y: data.y,
            label: data.label,
            title: data.title
        };

        if (data.label.trim() !== "" && data.title.trim() !== "") {
            callback(node_data_to_save);
            this.clearNodePopUp();
        } else {
            window.alert("Label und Tooltip d%FCrfen nicht leer sein.");
        }
    }
    // NODES ENDE

    // EDGES START
    clearEdgePopUp() {
        document.getElementById('saveEdgeButton').onclick = null;
        document.getElementById('cancelEdgeButton').onclick = null;
        // document.getElementById('EdgePopUp').style.display = 'none';
    }

    cancelEdgeEdit(callback) {
        this.clearEdgePopUp();
        callback(null);
    }

    saveEdge(data,callback) {
        data.label = document.getElementById('edge-label').value;
        data.title = document.getElementById('edge-title').value;

        var edge_data_to_save = {
            id: data.id,
            from: data.from,
            to: data.to,
            label: data.label,
            title: data.title
        };

        if (data.label.trim() !== "" && data.title.trim() !== "") {
            if (data.from === data.to) {
                let r = window.confirm("Soll der Knoten zu sich selbst verbunden werden?");
                if (r === true) {
                    callback(edge_data_to_save);
                    this.clearEdgePopUp();
                }
            }
            else {
                callback(edge_data_to_save);
                this.clearEdgePopUp();
            }
        } else {
            window.alert("Label und Tooltip d%FCrfen nicht leer sein.");
        }
    }
    // EDGES ENDE

    render() {
        return (
          <span>
              <div id="NodePopUp">
                <span id="node-operation">node</span>
                <table>
                <tr>
                    <td>label</td>
                    <td><input id="node-label" value="new value"/></td>
                </tr>
                <tr>
                    <td>title</td>
                    <td><input id="node-title" value="new value"/></td>
                </tr>
                <tr>
                    <td>file</td>
                    <td><input id="node-file" value="new value"/></td>
                </tr>
                </table>
                <input type="button" value="save" id="saveNodeButton"/>
                <input type="button" value="cancel" id="cancelNodeButton"/>
              </div>

              <div id="EdgePopUp">
                    <span id="edge-operation">edge</span>
                    <table>
                    <tr>
                        <td>label</td>
                        <td><input id="edge-label" value="new value"/></td>
                    </tr>
                    <tr>
                        <td>title</td>
                        <td><input id="edge-title" value="new value"/></td>
                    </tr>
                    </table>
                    <input type="button" value="save" id="saveEdgeButton"/>
                    <input type="button" value="cancel" id="cancelEdgeButton"/>
              </div>

              <div id="mynetwork"></div>
              <input type="button" value="sichern" onClick={() => this.sichern()} />
          </span>
        );
    }
}