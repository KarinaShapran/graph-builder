import React, {Component} from 'react';
import Graph from 'graph.js';

export default class Planning extends Component {

    constructor() {
        super();
        this.state = {
            processors: [
                {id: 0, isFree: true, actionsList: [], computing: "", completedComputing: [], writing: ''},
                {id: 1, isFree: true, actionsList: [], computing: "", completedComputing: [], writing: ''},
                {id: 2, isFree: true, actionsList: [], computing: "", completedComputing: [], writing: ''}],
            banks: [
                {id: 0, isFree: true, actionsList: [], currentAction: "", data: []},
                {id: 1, isFree: true, actionsList: [], currentAction: "", data: []},
            ],
            tact: 1,
            queue: [],
            mode: 1,
        };

        this.modeling = this.modeling.bind(this);
        this.isParentsDataComputed = this.isParentsDataComputed.bind(this);
        this.isParentsDataWritten = this.isParentsDataWritten.bind(this);
        this.isParentsDataRead = this.isParentsDataRead.bind(this);
        this.startWriting = this.startWriting.bind(this);
        this.startComputing = this.startComputing.bind(this);
        this.startReading = this.startReading.bind(this);
        this.stopProcess = this.stopProcess.bind(this);
    }

    componentDidUpdate(prevProps) {

        if (!prevProps.queue.length && this.props.queue.length) {
            console.log(this.props.queue);

            const queueWithoutMaxLength = this.props.queue.map(queueNode => {
                const {maxLength, links, parents, ...rest} = queueNode;

                if (parents) {
                    const parentsArr = [];
                    parents.forEach(parent => {
                        parentsArr.push({
                            id: parent,
                            isRead: false
                        })
                    });

                    return {...rest, links: parents, linksArr: parentsArr, outcomingLinks: links};
                }
                return {...rest, outcomingLinks: links};
            });

            const queueWithWeigth = queueWithoutMaxLength.map(node => {
                const nodeWithWeight = this.props.nodes.find(n => n.id == node.id);

                return {...node, weight: nodeWithWeight.label, weightToRead: 1}
            });

            this.props.sourceNodes.forEach(sourceNodeId => {
                const node = queueWithWeigth.find(node => node.id == sourceNodeId);

                node.isReadyToCompute = true;
            });

            this.setState({
                queue: queueWithWeigth
            });
        } else if (this.props.queue.length) {
            this.modeling();
        }


    }

    isParentsDataComputed(queue, node) {
        const nodesItDepentOn = queue.filter(queueNode => node.links.includes(queueNode.id));
        const areAllReady = nodesItDepentOn.every(n => n.isComputed === true);

        return areAllReady
    }

    isParentsDataWritten(queue, node) {
        const nodesItDepentOn = queue.filter(queueNode => node.links.includes(queueNode.id));
        const areAllReady = nodesItDepentOn.every(n => n.isWritten === true);

        return areAllReady
    }

    isParentsDataRead(queue, node) {
        if (node.links.length) {
            const areAllReady = node.linksArr.every(parent => parent.isRead);

            return areAllReady
        }

        return true
    }

    startWriting(updatedQueue, freeBanks, freeProcessors, queueIds, edges, tact) {
        const computedNodes = updatedQueue.filter(queueNode => queueNode.isComputed && !queueNode.isWritten);

        freeProcessors.forEach(freeProcessor => {
            computedNodes.filter(node => freeProcessor.completedComputing.includes(node.id)).forEach(computedNode => {
                const reallyFreeBank = freeBanks.find(exFreeBank => exFreeBank.isFree);

                if (freeProcessor.isFree && computedNode.writeStarted === undefined && reallyFreeBank) {
                    const connectedNodesStatusList = [];
                    let minQueueIndex = 9999;
                    computedNode.outcomingLinks.forEach(outcomingLink => {
                        const connectedNode = updatedQueue.find(qN => qN.id === outcomingLink);
                        connectedNodesStatusList.push({
                            id: connectedNode.id,
                            areParentsComputed: this.isParentsDataComputed(updatedQueue, connectedNode)
                        });
                    });

                    const computedNodesToBeTransfered = connectedNodesStatusList.filter(node => node.areParentsComputed);
                    let computedNodeToBeTransfered = null;

                    if (computedNodesToBeTransfered.length === 1) {
                        computedNodeToBeTransfered = computedNodesToBeTransfered[0];
                    } else {
                        const sorted = computedNodesToBeTransfered.sort((a, b) => queueIds.indexOf(a.id) - queueIds.indexOf(b.id));
                        computedNodeToBeTransfered = sorted[0];
                    }

                    if (computedNodeToBeTransfered) {
                        const edgeWeight = edges.find(edge => ((`${edge.from}` === computedNode.id) && (`${edge.to}` === computedNodeToBeTransfered.id))).label;
                        computedNode.writeStarted = tact;
                        computedNode.tactsToWrite = edgeWeight;
                        freeProcessor.isFree = false;
                        freeProcessor.writing = computedNode.id;
                        freeProcessor.actionsList.push(`W${computedNode.id}`);
                        reallyFreeBank.isFree = false;
                        reallyFreeBank.currentAction = computedNode.id;
                        reallyFreeBank.actionsList.push(`W${computedNode.id}`);
                        reallyFreeBank.actionType = 'writing';
                    }
                }
            });
        });
    }

    startComputing(updatedQueue, updatedProcessors, updatedBanks, tact) {
        const freeProcessorsAfterWriting = updatedProcessors.filter(updatedProcessor => updatedProcessor.isFree);

        // For each free processor
        freeProcessorsAfterWriting.forEach(freeProcessor => {
            const nodeThatRequireData = updatedQueue.find(
              queueNode => queueNode.isReadyToRead && queueNode.links && queueNode.linksArr.some(parent => !parent.isRead)
            );
            const areNodeParentsReading = updatedProcessors.find(proc => {
                if (nodeThatRequireData) {
                    return proc.isReadingParentsOf ===  nodeThatRequireData.id
                }
                return false;
            });

            // if (freeProcessor.banksWithData && freeProcessor.banksWithData.length) {
            //     // debugger
            //     const nodeThatNeedData = updatedQueue.find(qN => qN.id === freeProcessor.nodeThatRequireDataId);
            //     const realBanksWithData  = nodeThatNeedData.linksArr.filter(parent => !parent.isRead).map(parent => {
            //         return updatedBanks.find(bank => bank.data.includes(parent.id)).id
            //     });
            //     console.log('realBanksWithData', realBanksWithData);
            //
            //     const freeBankWithData = realBanksWithData
            //       .map(bankWithDataId => updatedBanks.find(bank => bank.id === bankWithDataId))
            //       .find(bankWithData => bankWithData.isFree);
            //
            //
            //     if (freeBankWithData) {
            //         const parents = updatedQueue.find(qN => qN.id === freeProcessor.nodeThatRequireDataId).linksArr;
            //         // debugger
            //         const parentToReadId = parents.find(parent => freeBankWithData.data.includes(parent.id)).id;
            //         const parentToRead = updatedQueue.find(qN => qN.id === parentToReadId);
            //         const nodeThatRequireData = updatedQueue.find(qN => qN.id === freeProcessor.nodeThatRequireDataId);
            //
            //         this.startReading({parentToRead, freeProcessor, bankWithData: freeBankWithData, tact, nodeThatRequireData});
            //         freeProcessor.banksWithData = null;
            //         freeProcessor.nodeThatRequireDataId = '';
            //     } else {
            //         freeProcessor.actionsList.push(`${tact}|`);
            //     }
            //
            //     return null
            // }

            if (freeProcessor.shouldCompute) {
                // Get first node from queue which is readyToCompute, is not started
                const nodeToCompute = updatedQueue.find(
                  queueNode => queueNode.id === freeProcessor.shouldCompute
                );

                // If there is node that can be started to be completed in this tact
                if (nodeToCompute) {
                    // Set the number of started tact
                    nodeToCompute.started = tact;
                    freeProcessor.isFree = false;
                    freeProcessor.computing = nodeToCompute.id;
                    freeProcessor.actionsList.push(nodeToCompute.id)
                }

                return null;
            }

            if (nodeThatRequireData && (freeProcessor.isReadingParentsOf === nodeThatRequireData.id || !areNodeParentsReading)) {
                let parentToRead = null;
                let bankWithData = null;
                const banksWithData = [];
                nodeThatRequireData.linksArr.filter(parent => !parent.isRead).find(parent => {
                    bankWithData = updatedBanks.find(bank => bank.data.includes(parent.id));
                    banksWithData.push(bankWithData.id);

                    if (bankWithData.isFree) {
                        parentToRead = updatedQueue.find(queueNode => queueNode.id === parent.id);
                        return true;
                    }

                    return false;
                });

                if (parentToRead) {
                    this.startReading({parentToRead, freeProcessor, bankWithData, tact, nodeThatRequireData});
                    freeProcessor.isReadingParentsOf = nodeThatRequireData.id;
                } else {
                    freeProcessor.actionsList.push(`**`);
                    freeProcessor.banksWithData = banksWithData;
                    // TODO waiting
                    freeProcessor.nodeThatRequireDataId = nodeThatRequireData.id;
                    freeProcessor.isFree = false;
                    freeProcessor.isWaiting = true;
                }

            } else {
                // Get first node from queue which is readyToCompute, is not started
                const nodeToCompute = updatedQueue.find(
                  queueNode => queueNode.isReadyToCompute && queueNode.started === undefined && !queueNode.links
                );

                // If there is node that can be started to be completed in this tact
                if (nodeToCompute) {
                    // Set the number of started tact
                    nodeToCompute.started = tact;
                    freeProcessor.isFree = false;
                    freeProcessor.computing = nodeToCompute.id;
                    freeProcessor.actionsList.push(nodeToCompute.id)
                }
            }
        });
    }

    startReading({parentToRead, freeProcessor, bankWithData, tact, nodeThatRequireData}) {
        freeProcessor.isFree = false;
        freeProcessor.reading = parentToRead.id;
        freeProcessor.actionsList.push(`R${parentToRead.id}`);

        bankWithData.isFree = false;
        bankWithData.currentAction = parentToRead.id;
        bankWithData.actionsList.push(`R${parentToRead.id}`);
        bankWithData.actionType = 'reading';

        parentToRead.readStarted = tact;
        parentToRead.nodeThatRequireDataId = nodeThatRequireData.id;
        parentToRead.isRead = false;
        parentToRead.readFinished = undefined;
    }

    stopProcess({updatedQueue, updatedProcessors, updatedBanks, tact, startedField, finishedField, isDoneField, processing, weight}) {
        // if (tact >= 16 && processing === 'reading') {
        //     debugger
        // }

        const startedNotFinished = updatedQueue.filter(
          queueNode => queueNode[startedField] !== undefined && queueNode[finishedField] === undefined
        );

        startedNotFinished.forEach(startedNotFinishedItem => {
            if (tact - startedNotFinishedItem[startedField] === Number.parseInt(startedNotFinishedItem[weight]) - 1) {
                startedNotFinishedItem[finishedField] = tact;
            }
        });

        const finishedInCurrentTact = updatedQueue.filter(queueNode => queueNode[finishedField] === tact);
        finishedInCurrentTact.forEach(node => {
            node[isDoneField] = true;

            const processorToSetFree = updatedProcessors.find(updatedProcessor => updatedProcessor[processing] === node.id);

            processorToSetFree[processing] = '';
            processorToSetFree.isFree = true;
            if (processing === 'computing') {
                processorToSetFree.completedComputing.push(node.id);
                processorToSetFree.shouldCompute = null;
            }

            if (processing === 'reading') {
                const bankToSetFree = updatedBanks.find(
                  updatedBank => updatedBank.currentAction === node.id
                );

                bankToSetFree.currentAction = '';
                bankToSetFree.isFree = true;

                const nodeThatRequireData = updatedQueue.find(n => n.id === node.nodeThatRequireDataId);
                const parent = nodeThatRequireData.linksArr.find(parent => parent.id === node.id);
                parent.isRead = true;
                if (this.isParentsDataRead([], nodeThatRequireData)) {
                    processorToSetFree.isReadingParentsOf = null;
                    processorToSetFree.shouldCompute = nodeThatRequireData.id;
                }
            }

            if (processing === 'writing') {
                const bankToSetFree = updatedBanks.find(
                  updatedBank => updatedBank.currentAction === node.id
                );

                bankToSetFree.currentAction = '';
                bankToSetFree.isFree = true;
                bankToSetFree.data.push(node.id);
            }
        });
    }

    modeling() {
        const {processors, banks, tact, queue} = this.state;
        const {nodes, sourceNodes, queueIds, edges} = this.props;

        const updatedQueue = [...queue];
        const updatedProcessors = [...processors];
        const updatedBanks = [...banks];

        const freeBanks = updatedBanks.filter(bank => bank.isFree);
        const busyBanks = updatedBanks.filter(bank => !bank.isFree);
        const freeProcessors = updatedProcessors.filter(processor => processor.isFree);
        const busyProcessors = updatedProcessors.filter(processor => !processor.isFree);

        if (updatedQueue.find(node => node.isComputed === undefined)) {
        // if (tact < 25) {
            console.log('tact', tact);
            // TODO waiting
            busyProcessors.filter(busyProcessor => busyProcessor.isWaiting).forEach(waitingProcessor => {
                const nodeThatRequireData = updatedQueue.find(qN => qN.id === waitingProcessor.nodeThatRequireDataId);
                if (nodeThatRequireData.linksArr.some(parent => parent.isRead)) {
                    waitingProcessor.isFree = true;
                    waitingProcessor.isWaiting = false;
                    waitingProcessor.nodeThatRequireDataId = null;
                }
            });

            // At the very beginning of tact set isReadyToCompute = true for nodes that depend on recently finished nodes
            updatedQueue.forEach(node => {
                if (!node.isReadyToCompute) {
                    if (this.isParentsDataComputed(queue, node) && this.isParentsDataWritten(queue, node)) {
                        node.isReadyToRead = true;
                    }

                    if (this.isParentsDataComputed(queue, node) && this.isParentsDataWritten(queue, node) && this.isParentsDataRead(queue, node)) {
                        node.isReadyToCompute = true;
                    }
                }
            });

            busyBanks.forEach(busyBank => {
                if (busyBank.actionType === 'writing') {
                    busyBank.actionsList.push(`W${busyBank.currentAction}`)
                } else if (busyBank.actionType === 'reading') {
                    busyBank.actionsList.push(`R${busyBank.currentAction}`)
                }
            });

            const realBusyProcessors = updatedProcessors.filter(proc => !proc.isFree);
            realBusyProcessors.forEach(busyProcessor => {
                if (busyProcessor.writing) {
                    busyProcessor.actionsList.push(`W${busyProcessor.writing}`);
                } else if (busyProcessor.reading) {
                    busyProcessor.actionsList.push(`R${busyProcessor.reading}`);
                } else {
                    busyProcessor.actionsList.push(busyProcessor.computing);
                }
            });

            this.startComputing(updatedQueue, updatedProcessors, updatedBanks, tact);
            this.startWriting(updatedQueue, freeBanks, freeProcessors, queueIds, edges, tact);


            const freeProcessorsAfterAll = updatedProcessors.filter(processor => processor.isFree);
            freeProcessorsAfterAll.forEach(freeProcessor => {
                if (!freeProcessor.nodeThatRequireDataId) {
                    freeProcessor.actionsList.push('_')
                }
            });

            const freeBanksAfterAll = updatedBanks.filter(bank => bank.isFree);
            freeBanksAfterAll.forEach(bank => {bank.actionsList.push('_')});

            this.stopProcess({
                updatedQueue,
                updatedProcessors,
                updatedBanks,
                tact,
                startedField: 'writeStarted',
                finishedField: 'writeFinished',
                weight: 'tactsToWrite',
                isDoneField: 'isWritten',
                processing: 'writing'
            });

            this.stopProcess({
                updatedQueue,
                updatedProcessors,
                tact,
                startedField: 'started',
                finishedField: 'finished',
                weight: 'weight',
                isDoneField: 'isComputed',
                processing: 'computing'
            });

            this.stopProcess({
                updatedQueue,
                updatedProcessors,
                updatedBanks,
                tact,
                startedField: 'readStarted',
                finishedField: 'readFinished',
                weight: 'weightToRead',
                isDoneField: 'isRead',
                processing: 'reading'
            });

            // Increment tact and update queue is state
            this.setState({
                tact: this.state.tact + 1,
                queue: updatedQueue,
                processors: updatedProcessors
            });
        }

    }


    render() {
        return (
          <div className={'planning'}>
              {this.state.processors.map(processor => {
                  return <div>
                      {processor.actionsList.map(action => {
                          return <span>{action}  </span>
                      })}
                  </div>
              })}
              <br/>
              <br/>
              {this.state.banks.map(bank => {
                  return <div>
                      {bank.actionsList.map(action => {
                          return <span>{action}</span>
                      })}
                  </div>
              })}
          </div>
        )
    }
}