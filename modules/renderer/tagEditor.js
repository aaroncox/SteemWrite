(function()
{
    var path = require('path'),
        _ = require('underscore');

    var categorySelectorValidation = require(path.resolve('./modules/steemit/CategorySelectorValidation.js'));

    function textStr2Array(str)
    {
        var tags = str.split(' ');
        tags = tags.filter(function(v) {
            return v !== '';
        });

        return tags;
    }

    function tagEditorRenderLabels(reqViewID, tags)
    {
        if (typeof tags == 'string') tags = textStr2Array(tags);

        $('#' + reqViewID + ' .tagsList').html(util.getViewHtml('editor/tagsList', {
            tags: tags,
            viewID: reqViewID
        }));
    }

    module.exports = {
        textStr2Array: textStr2Array,
        renderLabels: tagEditorRenderLabels,
        init: function(reqViewID, tagsStr)
        {
            if (typeof tagsStr == 'string') tagsStr = textStr2Array(tagsStr);

            $('#' + reqViewID + " [name='postTags']").val(tagsStr.join(' '));
            tagEditorRenderLabels(reqViewID, tagsStr);

            new window.Awesomplete(document.querySelector('#' + reqViewID + ' .tagsAutoCompleteBox'), {
                list: global.tags,
                filter: window.Awesomplete.FILTER_STARTSWITH,
                minChars: 1,
                maxItems: 15
            });
        },
        addTagForm: function(formSelector)
        {
            var form = $(formSelector).serializeJSON();
            $('#' + form._tagViewID + ' .tagsUIArea :input, #' + form._tagViewID + ' .tagsUIArea :button').attr('disabled', true);

            if ($('#' + form._tagViewID).length > 0)
            {
                var spaceOrCommaErr = 'Use only lowercase letters, digits and one dash';

                var tagVal = form._tagName.replace(/\s+/g, ' ');
                tagVal = tagVal.trim();

                if (tagVal.indexOf(' ') > -1 || tagVal.indexOf(',') > -1)
                {
                    bootbox.alert({
                        title: 'Add Tag',
                        message: spaceOrCommaErr
                    });

                }
                else
                {
                    var validationResult = categorySelectorValidation.validateCategory(tagVal);

                    if (validationResult) //not null - error
                    {
                        bootbox.alert({
                            title: 'Add Tag',
                            message: validationResult
                        });
                    }
                    else
                    {
                        var tagsArray = $('#' + form._tagViewID + " [name='postTags']").val();

                        if (typeof tagsArray == 'string')
                        {
                            tagsArray = textStr2Array(tagsArray);

                            if (_.contains(tagsArray, tagVal))
                            {
                                bootbox.alert({
                                    title: 'Add Tag',
                                    message: tagVal + ' already added'
                                });

                            }
                            else
                            {
                                if (tagsArray.length == 5)
                                {
                                    bootbox.alert({
                                        title: 'Add Tag',
                                        message: 'Please use only five categories'
                                    });

                                }
                                else
                                {
                                    tagsArray.push(tagVal);
                                    $('#' + form._tagViewID + " [name='postTags']").val(tagsArray.join(' '));
                                    $('#' + form._tagViewID + " [name='_tagName']").val('');
                                }

                            }

                            //update tags ui
                            tagEditorRenderLabels(form._tagViewID, tagsArray);

                        }

                    }

                }

            }

            $('#' + form._tagViewID + ' .tagsUIArea :input, #' + form._tagViewID + ' .tagsUIArea :button').attr('disabled', false);
            return false;

        },
        removeTagBtn: function(btnSelector)
        {
            var viewID = $(btnSelector).attr('data-viewID');
            var tag = $(btnSelector).attr('data-tag');
            var postStatus = $('#' + viewID + " [name='_postStatus']").val();

            if (typeof viewID == 'string' && typeof tag == 'string' && typeof postStatus == 'string')
            {
                if ($('#' + viewID).length > 0)
                {
                    $('#' + viewID + ' .tagsUIArea :input, #' + viewID + ' .tagsUIArea :button').attr('disabled', true);

                    var tagsArray = $('#' + viewID + " [name='postTags']").val();

                    if (typeof tagsArray == 'string')
                    {
                        tagsArray = textStr2Array(tagsArray);

                        var canRemove = false;
                        if (postStatus == 'published' && tagsArray.length > 0 && tagsArray[0] == tag)
                        {
                            bootbox.alert('The first tag cannot be removed once published');
                        }
                        else
                        {
                            canRemove = true;
                        }

                        if (canRemove)
                        {
                            tagsArray = _.without(tagsArray, tag);
                            $('#' + viewID + " [name='postTags']").val(tagsArray.join(' '));

                            //update tags ui
                            tagEditorRenderLabels(viewID, tagsArray);
                        }

                    }

                    $('#' + viewID + ' .tagsUIArea :input, #' + viewID + ' .tagsUIArea :button').attr('disabled', false);

                }

            }

        }

    };

})();
