(function ($) {
    $.SortableGridView = function (options) {
        var defaultOptions = {
            id: 'sortable-grid-view',
            action: 'sortItem',
            sortingPromptText: 'Loading...',
            sortingFailText: 'Fail to sort',
            moveItem: '',
            csrfTokenName: '',
            csrfToken: '',
        };

        $.extend({}, defaultOptions, options);

        $('body').append('<div class="modal fade" id="' + options.id + '-sorting-modal" tabindex="-1" role="dialog"><div class="modal-dialog"><div class="modal-content"><div class="modal-body">' + options.sortingPromptText + '</div></div></div></div>');

        var regex = /items\[\]\_(\d+)/;

        $('#' + options.id + ' .sortable-grid-view tbody').sortable({
            handle: options.moveItem,
            update: function () {
                $('#' + options.id + '-sorting-modal').modal('show');
                serial = [];


                $('#' + options.id + ' .sortable-grid-view tbody.ui-sortable tr').each(function () {
                    serial.push($(this).data('key'));
                });

                var length = serial.length;
                var currentRecordNo = 0;
                var successRecordNo = 0;
                var data = [];

                if (length > 0) {
                    for (var i = 0; i < length; i++) {
                        var itemID = serial[i];
                        data.push(itemID)
                        currentRecordNo++;

                        if (currentRecordNo == 500 || i == (length - 1)) {
                            (function (currentRecordNo) {
                                $.ajax({
                                    'url': options.action,
                                    'type': 'post',
                                    'data': {'items': data, [options.csrfTokenName]: options.csrfToken},
                                    success: function (data) {
                                        checkSuccess(currentRecordNo);
                                        $.pjax.reload('#tableOfPartner', {timeout: false});
                                        $('#tableOfPartner').on('pjax:end', () => {
                                            const event = new Event('pjaxEnd');
                                            document.dispatchEvent(event);
                                        });
                                    },
                                    error: function (data) {
                                        $('#' + options.id + '-sorting-modal').modal('hide');
                                        alert(options.sortingFailText);
                                    }
                                });
                            })(currentRecordNo);
                            currentRecordNo = 0;
                            data = [];
                        }
                    }
                }

                function checkSuccess(count) {
                    successRecordNo += count;

                    if (successRecordNo >= length) {
                        $('#' + options.id + '-sorting-modal').modal('hide');
                    }
                }
            },
        });
    };
})(jQuery);
