/*
    This file is generated and updated by Sencha Cmd. You can edit this file as
    needed for your application, but these edits will have to be merged by
    Sencha Cmd when upgrading.
*/

Ext.Loader.setPath('Ext.ux', './ext/src/ux');
Ext.Loader.setPath('Ext.util', './ext/src/util');
Ext.Loader.setPath({
	'Ext.ux.desktop': 'ext/js',
	MyDesktop: 'desktop'
});

Ext.application({
    name: 'EJS',
    extend: 'EJS.Application',
    autoCreateViewport: true
});
