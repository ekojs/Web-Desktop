Ext.define('Ext.override.ComboBox', {
    override : 'Ext.form.field.ComboBox',
    
    findRecord: function(field, value) {
        var foundRec = null;
        Ext.each(this.lastSelection, function(rec) {
            if (rec.get(field) === value) {
                foundRec = rec;
                return false; // stop 'each' loop
            }
			return true;
        });
        if (foundRec) {
            return foundRec;
        } else {
            return this.callParent(arguments);
        }
    }
});
