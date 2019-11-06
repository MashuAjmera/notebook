// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define([
    'jquery',
    'base/js/namespace',
    'tree/js/notebooklist',
    'base/js/i18n'
], function($, IPython, notebooklist, i18n) {
    "use strict";
    
    var RecentList = function (selector, options) {//mru
        /**
         * Constructor
         *
         * Parameters:
         *  selector: string
         *  options: dictionary
         *      Dictionary of keyword arguments.
         *          session_list: SessionList instance
         *          base_url: string
         *          notebook_path: string
         */
        notebooklist.NotebookList.call(this, selector, $.extend({
            element_name: 'running'},//mru
            options));
        this.kernelspecs = this.sessions = null;
        this.events.on('kernelspecs_loaded.KernelSpec', $.proxy(this._kernelspecs_loaded, this));
    };

    RecentList.prototype = Object.create(notebooklist.NotebookList.prototype);//mru

    RecentList.prototype.add_duplicate_button = function () {//mru
        /**
         * do nothing
         */
    };
    
    RecentList.prototype._kernelspecs_loaded = function (event, kernelspecs) {//mru
        this.kernelspecs = kernelspecs;
        if (this.sessions) {
            // trigger delayed session load, since kernelspecs arrived later
            this.sessions_loaded(this.sessions);
        }
    };
    
    RecentList.prototype.sessions_loaded = function (d) {//mru
        this.sessions = d;
        if (!this.kernelspecs) {
            return; // wait for kernelspecs before first load
        }
        this.clear_list();
        var item, path, session, info;
        for (path in d) {
            if (!d.hasOwnProperty(path)) {
                // nothing is safe in javascript
                continue;
            }
            session = d[path];
            item = this.new_item(-1);
            info = this.kernelspecs[session.kernel.name];
            this.add_link({
                name: path,
                path: path,
                type: 'notebook',
                kernel_display_name: (info && info.spec) ? info.spec.display_name : session.kernel.name
            }, item);
        }
        $('#recent_list_placeholder').toggle($.isEmptyObject(d));//mru
    };

    RecentList.prototype.add_link = function (model, item) {//mru
        notebooklist.NotebookList.prototype.add_link.apply(this, [model, item]);

        var running_indicator = item.find(".item_buttons")
            .text('');

        var that = this;
        var kernel_name = $('<div/>')
            .addClass('kernel-name')
            .text(model.kernel_display_name)
            .appendTo(running_indicator);

        var shutdown_button = $('<button/>')
            .addClass('btn btn-warning btn-xs')
            .text(i18n._('Shutdown'))
            .click(function() {
                var path = $(this).parent().parent().parent().data('path');
                that.shutdown_notebook(path);
            })
            .appendTo(running_indicator);
    };
    
    // Backwards compatibility.
    IPython.RecentList = RecentList;//mru

    return {'RecentList': RecentList};//mru
});
