/**@jsx React.DOM   */
/*jslint node: true */
/*global $ */
"use strict";

var React = require('react');
var ListenerMixin = require('./ListenerMixin');
var Underscore = require('Underscore');

var Library = React.createClass({

    mixins: [ListenerMixin],
    
    getInitialState: function () {
        return {
            records: [],
            edit: { mountpath: '', path: '', type: ''}
        };
    },
    
    sort: function (records) {
        return records.sort(function (a, b) {
            var al = a.mountpath.toLowerCase(),
                bl = b.mountpath.toLowerCase();
            return al < bl ? -1 : al > bl ? 1 : 0;
        });
    },
    
    onEvent: function (data) {
        this.setState({
            records: this.sort(data.slice(0)),
            selectedCount: 0
        });

        this.setChanging(false);
    },
    
    onRowClick: function (event) {

        var index = event.currentTarget.getAttribute('data-index');
        this.inverseSelection(index);
    },
    
    inverseSelection: function (index) {
        
        var records = this.state.records.slice(0),
            checked = this.state.records[index].selected ? false : true;
        
        records[index].selected = checked;
        
        this.setState({
            records: records,
            selectedCount: this.state.selectedCount + (checked ? 1 : -1)
        });
        
        if (this.state.selectedCount === 0 && checked) {
            this.setState({
                edit: {
                    mountpath: records[index].mountpath,
                    path: records[index].path,
                    type: records[index].type
                }
            });
        }
    },
    
    onMountpathChange: function (event) {
        this.setState({
            edit: Underscore.defaults({mountpath: event.target.value}, this.state.edit)
        });
    },

    onPathChange: function (event) {
        this.setState({
            edit: Underscore.defaults({path: event.target.value.replace(/\\/g, '\/')}, this.state.edit)
        });
    },

    onTypeChange: function (event) {
        this.setState({
            edit: Underscore.defaults({type: event.target.value}, this.state.edit)
        });
    },
    
    onAdd: function (event) {
        
        if (this.state.selectedCount === 1) {
            this.onDelete(event);
        }
            
        var add = {
            mountpath: this.state.edit.mountpath,
            path: this.state.edit.path,
            type: this.state.edit.type
        };

        this.setState({ edit: { mountpath: '', path: '', type: ''} });
        this.setChanging(true);

        this.props.emitter.emit('upnp-command', {
            'command': 'add-reps',
            'list': [ add ]
        });
    },
    
    onDelete: function (event) {
        
        var i, item, remove = [];
        for (i = 0; i < this.state.records.length; i += 1) {
            if (this.state.records[i].selected) {
                item = {
                    mountpath: this.state.records[i].mountpath,
                    path: this.state.records[i].path,
                    type: this.state.records[i].type
                };
                remove.push(item);
            }
        }
        
        this.setChanging(true);
        
        this.props.emitter.emit('upnp-command', {
            'command': 'delete-reps',
            'list': remove
        });
    },
    
    setChanging: function (value) {
        
        if (this.changingTimer) {
            
            clearTimeout(this.changingTimer);
            this.changingTimer = null;
        }
        
        if (this.state.changing !== value) {
            
            var self = this;
            this.changingTimer = setTimeout(function () {
                self.setState({changing: value});
            }, value ? 400 : 1500);
        }
    },
    
    getErrors: function () {
        
        var errors = {
            mountpath: !(/^\/(([\w]+\/)*[\w]+)?$/.test(this.state.edit.mountpath)),
            path: !(/^(?:[\w]\:|[\/\\])([\/\\][A-Za-z_\-\s0-9\.]*)+$/.test(this.state.edit.path)),
            type: !(/music|path/.test(this.state.edit.type)),
            messages: []
        };
        
        if (this.state.edit.mountpath !== '' || this.state.edit.path !== '' || this.state.edit.type !== '') {
            
            if (errors.mountpath) {
                errors.messages.push('The mount path expected, e.g. /music/retro');
            }

            if (errors.path) {
                errors.messages.push('The path expected, e.g. C:/Folder/Other');
            }

            if (errors.type) {
                errors.messages.push('Select type');
            }
        }
        
        errors.value = errors.mountpath || errors.path || errors.type;
        errors.noerror = !errors.value;
        
        return errors;
    },
    
    selectDir: function (event) {
        event.preventDefault();
        $('#select-dir>input:file').click();
    },
    
    componentDidMount: function () {
        
        var self = this;
        
        $('#select-dir').append(
            $('<input>')
                .attr('type', 'file')
                .attr('nwdirectory', '')
                .css({ width: 0, height: 0 })
                .on('change', function (event) {
                    var path = $('#select-dir>input:file').val();
                    if (path) {
                        self.setState({
                            edit: Underscore.defaults({path: path.replace(/\\/g, '\/')}, self.state.edit)
                        });
                    }
                })
        );
    },
    
    render: function () {

        /*jslint white: true */
        if (this.state.changing) {
            return (
                <div>
                    <p>Save changes...</p>
                </div>
            );
        } else {
            var errors = this.getErrors(),
                list = this.state.records.map(function (item, index) {
                
                    var checkbox = <input type='checkbox' readOnly />;
                    checkbox.props.checked = item.selected ? true : false;
                        
                    return (
                        <tr key={index} className={item.selected ? 'warning' : ''} onClick={this.onRowClick} data-index={index}>
                            <td>{checkbox}</td>
                            <td>{item.mountpath}</td>
                            <td>{item.path}</td>
                            <td>{item.type}</td>
                        </tr>
                    );
                }, this),
                table = (
                    <table className='table table-condensed table-hover'>
                        <thead>
                            <tr>
                                <th className="col-xs-1"> </th>
                                <th className="col-xs-4">Mount path</th>
                                <th className="col-xs-4">Path</th>
                                <th className="col-xs-3">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list}
                        </tbody>
                    </table>
                ),
                noLibrary = (
                    <div>
                        <p>No libraries</p>
                    </div>
                ),
                errorMessages = errors.noerror ? '' : (<p className='text-danger text-right'>{React.Children.map(errors.messages, function(message) {
                    return (<small>{message}<br/></small>);
                }, this)}</p>);
                
            return (
                <div>
                
                    { (this.state.records.length === 0) ? noLibrary : table }

                    <div className={'formwrap' + (this.state.selectedCount <= 1 ? '' : ' display-none')}>
                        <form className="form-inline" role="form">
                            <div className="col-xs-1"></div>
                            <div className="col-xs-4 form-group">
                                <label /*for="mount"*/ className="sr-only">Mount path</label>
                                <input type="text" className={'form-control' + (errors.mountpath ? ' error' : '')} id="mount" placeholder="Mount path"
                                    value={this.state.edit.mountpath} onChange={this.onMountpathChange} />
                            </div>
                            <div className="col-xs-4">
                                <div className="input-group">
                                    <input type="text" className={'form-control' + (errors.path ? ' error' : '')} placeholder="Path"
                                        value={this.state.edit.path} onChange={this.onPathChange}/>
                                    <span className="input-group-btn">
                                        <button className="btn btn-default" type="button" onClick={this.selectDir}>...</button>
                                    </span>
                                </div>
                            </div>
                            <div className="col-xs-3">
                                <select className={'form-control' + (errors.type ? ' error' : '')}
                                    value={this.state.edit.type} onChange={this.onTypeChange}>
                                    <option value=''></option>
                                    <option value='path'>path</option>
                                    <option value='music'>music</option>
                                </select>
                            </div>
                        </form>
                        {errorMessages}
                    </div>
                    
                    <div id="select-dir"></div>
                
                    <div className="btngroup">
                        <button 
                            type="button"
                            className={'btn btn-default btn-warning' + (this.state.selectedCount <= 1 && errors.value === false ? '' : ' disabled')}
                            onClick={this.onAdd}>
                                {this.state.selectedCount ? 'Save' : 'Add'}
                        </button>
                        <button type="button" className={'btn btn-default btn-danger' + (this.state.selectedCount ? '' : ' disabled')} onClick={this.onDelete}>
                            {'Delete' + (this.state.selectedCount ? ' (' + this.state.selectedCount + ')' : '')}
                        </button>
                    </div>
                </div>
            );
        }
    }

    });

module.exports = Library;