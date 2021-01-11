// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Platform, ScrollView, Text, View} from 'react-native';
import {intlShape} from 'react-intl';
import HWKeyboardEvent from 'react-native-hw-keyboard-event';
import {SafeAreaView} from 'react-native-safe-area-context';

import Autocomplete from '@components/autocomplete';
import CompassIcon from '@components/compass_icon';
import PostInput from '@components/post_draft/post_input';
import QuickActions from '@components/post_draft/quick_actions';
import SendAction from '@components/post_draft/send_action';
import Typing from '@components/post_draft/typing';
import Uploads from '@components/post_draft/uploads';
import {CHANNEL_POST_TEXTBOX_CURSOR_CHANGE, CHANNEL_POST_TEXTBOX_VALUE_CHANGE, IS_REACTION_REGEX} from '@constants/post_draft';
import {NOTIFY_ALL_MEMBERS} from '@constants/view';
import EventEmitter from '@mm-redux/utils/event_emitter';
import EphemeralStore from '@store/ephemeral_store';
import * as DraftUtils from '@utils/draft';
import {confirmOutOfOfficeDisabled} from '@utils/status';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';
import {TouchableOpacity} from 'react-native-gesture-handler';
const AUTOCOMPLETE_MARGIN = 20;
const AUTOCOMPLETE_MAX_HEIGHT = 200;
const HW_SHIFT_ENTER_TEXT = Platform.OS === 'ios' ? '\n' : '';
const HW_EVENT_IN_SCREEN = ['Channel', 'Thread'];

export default class DraftInput extends PureComponent {
    static propTypes = {
        testID: PropTypes.string,
        registerTypingAnimation: PropTypes.func.isRequired,
        addReactionToLatestPost: PropTypes.func.isRequired,
        getChannelMemberCountsByGroup: PropTypes.func.isRequired,
        channelDisplayName: PropTypes.string,
        channelId: PropTypes.string.isRequired,
        createPost: PropTypes.func.isRequired,
        currentUserId: PropTypes.string.isRequired,
        cursorPositionEvent: PropTypes.string,
        enableConfirmNotificationsToChannel: PropTypes.bool,
        executeCommand: PropTypes.func.isRequired,
        files: PropTypes.array,
        getChannelTimezones: PropTypes.func.isRequired,
        handleClearFiles: PropTypes.func.isRequired,
        handleClearFailedFiles: PropTypes.func.isRequired,
        isLandscape: PropTypes.bool.isRequired,
        isTimezoneEnabled: PropTypes.bool,
        maxMessageLength: PropTypes.number.isRequired,
        membersCount: PropTypes.number,
        rootId: PropTypes.string,
        screenId: PropTypes.string.isRequired,
        setStatus: PropTypes.func.isRequired,
        theme: PropTypes.object.isRequired,
        useChannelMentions: PropTypes.bool.isRequired,
        userIsOutOfOffice: PropTypes.bool.isRequired,
        value: PropTypes.string.isRequired,
        valueEvent: PropTypes.string,
        useGroupMentions: PropTypes.bool.isRequired,
        channelMemberCountsByGroup: PropTypes.object,
        groupsWithAllowReference: PropTypes.object,
        addRecentUsedEmojisInMessage: PropTypes.func.isRequired,
        replyPopup: PropTypes.object,
        setReplyPopup: PropTypes.func.isRequired,
    };

    static defaultProps = {
        cursorPositionEvent: CHANNEL_POST_TEXTBOX_CURSOR_CHANGE,
        files: [],
        rootId: '',
        valueEvent: CHANNEL_POST_TEXTBOX_VALUE_CHANGE,
    };

    static contextTypes = {
        intl: intlShape,
    };

    constructor(props) {
        super(props);

        this.input = React.createRef();
        this.quickActions = React.createRef();

        this.state = {
            canSubmit: false,
            channelTimezoneCount: 0,
            sendingMessage: false,
            top: 0,
        };
    }

    closeReplyPopup = () => {
        this.props.setReplyPopup();
    }

    componentDidMount() {
        const {getChannelMemberCountsByGroup, channelId, isTimezoneEnabled, useGroupMentions, value} = this.props;

        HWKeyboardEvent.onHWKeyPressed(this.handleHardwareEnterPress);

        if (value) {
            this.setInputValue(value);
        }

        if (useGroupMentions) {
            getChannelMemberCountsByGroup(channelId, isTimezoneEnabled);
        }
    }

    componentDidUpdate(prevProps) {
        const {channelId, rootId, value, files, useGroupMentions, getChannelMemberCountsByGroup, isTimezoneEnabled, replyPopup} = this.props;
        const diffChannel = channelId !== prevProps?.channelId;
        const diffTimezoneEnabled = isTimezoneEnabled !== prevProps?.isTimezoneEnabled;
        if (this.input.current) {
            const diffThread = rootId !== prevProps.rootId;
            if (diffChannel || diffThread) {
                const trimmed = value.trim();
                this.setInputValue(trimmed);
                this.updateQuickActionValue(trimmed);
            }

            if (replyPopup?.message && !prevProps.replyPopup?.message) {
                this.input.current.focus();
            }
        }

        if (diffTimezoneEnabled || diffChannel) {
            this.numberOfTimezones();
            if (useGroupMentions) {
                getChannelMemberCountsByGroup(channelId, isTimezoneEnabled);
            }
        }

        if (prevProps.files !== files) {
            this.updateCanSubmit();
        }
    }

    componentWillUnmount() {
        HWKeyboardEvent.removeOnHWKeyPressed();
    }

    canSend = () => {
        const {files, maxMessageLength} = this.props;
        const value = this.input.current?.getValue() || '';
        const messageLength = value.trim().length;

        if (messageLength > maxMessageLength) {
            return false;
        }

        if (files.length) {
            const loadingComplete = !this.isFileLoading();
            return loadingComplete;
        }

        return messageLength > 0;
    };

    doSubmitMessage = (message = null, rootId) => {
        const {createPost, currentUserId, channelId, files, handleClearFiles, replyPopup} = this.props;
        let value = message;
        if (!value) {
            value = this.input.current?.getValue() || '';
        }
        const postFiles = files.filter((f) => !f.failed);
        if (replyPopup?.user_name) {
            value = `@${replyPopup.user_name} ${value}`;
        }
        const post = {
            user_id: currentUserId,
            channel_id: channelId,
            root_id: rootId,
            parent_id: rootId,
            props: {
                reply_user_name: replyPopup?.user_name,
                reply_message: replyPopup?.message},
            message: value,
        };

        createPost(post, postFiles).then(({data}) => {
            if (data) {
                this.props.addRecentUsedEmojisInMessage(message);
            }
        });

        if (postFiles.length) {
            handleClearFiles(channelId, rootId);
        }

        if (this.input.current) {
            this.setInputValue('');
            this.input.current.changeDraft('');
        }

        this.setState({sendingMessage: false});

        if (Platform.OS === 'android') {
            // Fixes the issue where Android predictive text would prepend suggestions to the post draft when messages
            // are typed successively without blurring the input
            const nextState = {
                keyboardType: 'email-address',
            };

            const callback = () => this.setState({keyboardType: 'default'});

            this.setState(nextState, callback);
        }

        EventEmitter.emit('scroll-to-bottom');
    };

    handleHardwareEnterPress = (keyEvent) => {
        if (HW_EVENT_IN_SCREEN.includes(EphemeralStore.getNavigationTopComponentId())) {
            switch (keyEvent.pressedKey) {
            case 'enter':
                this.handleSendMessage();
                break;
            case 'shift-enter':
                this.onInsertTextToDraft(HW_SHIFT_ENTER_TEXT);
                break;
            }
        }
    }

    handleInputQuickAction = (inputValue) => {
        if (this.input.current) {
            this.setInputValue(inputValue, true);
            this.input.current.focus();
        }
    };

    onInsertTextToDraft = (text) => {
        if (this.input.current) {
            this.input.current.handleInsertTextToDraft(text);
        }
    };

    handleLayout = (e) => {
        this.setState({
            top: e.nativeEvent.layout.y,
        });
    };

    handleSendMessage = () => {
        if (!this.input.current) {
            return;
        }

        const value = this.input.current.getValue();
        this.input.current.resetTextInput();
        const rootId = (this.props.replyPopup.root_id || this.props.rootId);
        requestAnimationFrame(() => {
            if (!this.isSendButtonEnabled()) {
                this.input.current.setValue(value);
                return;
            }

            this.setState({sendingMessage: true});

            const {channelId, files, handleClearFailedFiles} = this.props;

            const isReactionMatch = value.match(IS_REACTION_REGEX);
            if (isReactionMatch) {
                const emoji = isReactionMatch[2];
                this.sendReaction(emoji, rootId);
                return;
            }

            const hasFailedAttachments = files.some((f) => f.failed);
            if (hasFailedAttachments) {
                const {formatMessage} = this.context.intl;
                const cancel = () => {
                    this.setInputValue(value);
                    this.setState({sendingMessage: false});
                };
                const accept = () => {
                    // Remove only failed files
                    handleClearFailedFiles(channelId, rootId);
                    this.sendMessage(value, rootId);
                };

                DraftUtils.alertAttachmentFail(formatMessage, accept, cancel);
            } else {
                this.sendMessage(value, rootId);
            }
        });
    }

    isFileLoading = () => {
        const {files} = this.props;

        return files.some((file) => file.loading);
    };

    isSendButtonEnabled = () => {
        return this.canSend() && !this.isFileLoading() && !this.state.sendingMessage;
    };

    numberOfTimezones = async () => {
        const {channelId, getChannelTimezones} = this.props;
        const {data} = await getChannelTimezones(channelId);
        this.setState({channelTimezoneCount: data?.length || 0});
    };

    sendCommand = async (msg, rootId) => {
        const {intl} = this.context;
        const {channelId, executeCommand, userIsOutOfOffice} = this.props;

        const status = DraftUtils.getStatusFromSlashCommand(msg);
        if (userIsOutOfOffice && DraftUtils.isStatusSlashCommand(status)) {
            confirmOutOfOfficeDisabled(intl, status, this.updateStatus);
            this.setState({sendingMessage: false});
            return;
        }

        const {error} = await executeCommand(msg, channelId, rootId);
        this.setState({sendingMessage: false});

        if (error) {
            this.setInputValue(msg);
            DraftUtils.alertSlashCommandFailed(intl.formatMessage, error.message);
            return;
        }

        this.setInputValue('');
        this.input.current.changeDraft('');
    };

    sendMessage = (value = '', rootId) => {
        const {channelMemberCountsByGroup, enableConfirmNotificationsToChannel, groupsWithAllowReference, membersCount, useGroupMentions, useChannelMentions} = this.props;
        const notificationsToChannel = enableConfirmNotificationsToChannel && useChannelMentions;
        const notificationsToGroups = enableConfirmNotificationsToChannel && useGroupMentions;
        const toAllOrChannel = DraftUtils.textContainsAtAllAtChannel(value);
        const groupMentions = (!toAllOrChannel && notificationsToGroups) ? DraftUtils.groupsMentionedInText(groupsWithAllowReference, value) : [];

        if (value.indexOf('/') === 0) {
            this.sendCommand(value);
        } else if (notificationsToChannel && membersCount > NOTIFY_ALL_MEMBERS && toAllOrChannel) {
            this.showSendToAllOrChannelAlert(membersCount, value);
        } else if (groupMentions.length > 0) {
            const {groupMentionsSet, memberNotifyCount, channelTimezoneCount} = DraftUtils.mapGroupMentions(channelMemberCountsByGroup, groupMentions);
            if (memberNotifyCount > 0) {
                this.showSendToGroupsAlert(Array.from(groupMentionsSet), memberNotifyCount, channelTimezoneCount, value);
            } else {
                this.doSubmitMessage(value, rootId);
            }
        } else {
            this.doSubmitMessage(value, rootId);
        }
    };

    sendReaction = (emoji, rootId) => {
        const {addReactionToLatestPost} = this.props;
        addReactionToLatestPost(emoji, rootId);

        this.setInputValue('');
        this.input.current.changeDraft('');

        this.setState({sendingMessage: false});
    };

    setInputValue = (value, autocomplete = false) => {
        if (this.input.current) {
            this.input.current.setValue(value, autocomplete);
            this.updateCanSubmit();
        }
    }

    showSendToAllOrChannelAlert = (membersCount, msg) => {
        const {formatMessage} = this.context.intl;
        const {channelTimezoneCount} = this.state;
        const {isTimezoneEnabled} = this.props;
        const notifyAllMessage = DraftUtils.buildChannelWideMentionMessage(formatMessage, membersCount, isTimezoneEnabled, channelTimezoneCount);
        const cancel = () => {
            this.setInputValue(msg);
            this.setState({sendingMessage: false});
        };

        DraftUtils.alertChannelWideMention(formatMessage, notifyAllMessage, this.doSubmitMessage, cancel);
    };

    showSendToGroupsAlert = (groupMentions, memberNotifyCount, channelTimezoneCount, msg) => {
        const {formatMessage} = this.context.intl;
        const notifyAllMessage = DraftUtils.buildGroupMentionsMessage(formatMessage, groupMentions, memberNotifyCount, channelTimezoneCount);
        const cancel = () => {
            this.setInputValue(msg);
            this.setState({sendingMessage: false});
        };

        DraftUtils.alertSendToGroups(formatMessage, notifyAllMessage, this.doSubmitMessage, cancel);
    };

    updateCanSubmit = () => {
        const {canSubmit} = this.state;
        const enabled = this.isSendButtonEnabled();

        if (canSubmit !== enabled) {
            this.setState({canSubmit: enabled});
        }
    }

    updateQuickActionValue = (value) => {
        if (this.quickActions.current) {
            this.quickActions.current.handleInputEvent(value);
        }

        this.updateCanSubmit();
    }

    updateStatus = (status) => {
        const {currentUserId, setStatus} = this.props;

        setStatus({user_id: currentUserId, status});
    };

    renderReplyPopup = (style, replyPopup) => (
        <View style={style.replyContainer}>
            <View style={style.replyHeader}>
                <Text>{replyPopup.user_name + ':'} </Text>
                <TouchableOpacity
                    onPress={this.closeReplyPopup}
                >
                    <CompassIcon
                        name='close'
                        style={style.closeButton}
                    />
                </TouchableOpacity>
            </View>
            <Text >{replyPopup.message}</Text>
        </View>)

    render() {
        const {
            testID,
            channelDisplayName,
            channelId,
            cursorPositionEvent,
            files,
            isLandscape,
            maxMessageLength,
            screenId,
            valueEvent,
            registerTypingAnimation,
            rootId,
            theme,
            replyPopup,
        } = this.props;
        const postInputTestID = `${testID}.post.input`;
        const quickActionsTestID = `${testID}.quick_actions`;
        const sendActionTestID = `${testID}.send_action`;
        const style = getStyleSheet(theme);
        return (
            <>
                <Typing
                    theme={theme}
                    registerTypingAnimation={registerTypingAnimation}
                />

                {replyPopup?.message && this.renderReplyPopup(style, replyPopup)}

                <SafeAreaView
                    edges={['left', 'right']}
                    onLayout={this.handleLayout}
                    style={style.inputWrapper}
                    testID={testID}
                >
                    <ScrollView
                        style={style.inputContainer}
                        contentContainerStyle={style.inputContentContainer}
                        keyboardShouldPersistTaps={'always'}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        pinchGestureEnabled={false}
                        overScrollMode={'never'}
                        disableScrollViewPanResponder={true}
                    >
                        <PostInput
                            testID={postInputTestID}
                            channelDisplayName={channelDisplayName}
                            channelId={channelId}
                            cursorPositionEvent={cursorPositionEvent}
                            inputEventType={valueEvent}
                            isLandscape={isLandscape}
                            maxMessageLength={maxMessageLength}
                            ref={this.input}
                            rootId={rootId}
                            screenId={screenId}
                            theme={theme}
                            updateInitialValue={this.updateQuickActionValue}
                        />
                        <Uploads
                            files={files}
                            rootId={rootId}
                            screenId={screenId}
                            theme={theme}
                        />
                        <View style={style.actionsContainer}>
                            <QuickActions
                                testID={quickActionsTestID}
                                ref={this.quickActions}
                                fileCount={files.length}
                                inputEventType={valueEvent}
                                onTextChange={this.handleInputQuickAction}
                                theme={theme}
                            />
                            <SendAction
                                testID={sendActionTestID}
                                disabled={!this.state.canSubmit}
                                handleSendMessage={this.handleSendMessage}
                                theme={theme}
                            />
                        </View>
                    </ScrollView>
                </SafeAreaView>
                {Platform.OS === 'android' &&
                <Autocomplete
                    cursorPositionEvent={cursorPositionEvent}
                    maxHeight={Math.min(this.state.top - AUTOCOMPLETE_MARGIN, AUTOCOMPLETE_MAX_HEIGHT)}
                    onChangeText={this.handleInputQuickAction}
                    valueEvent={valueEvent}
                    rootId={rootId}
                    channelId={channelId}
                />
                }
            </>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        actionsContainer: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: Platform.select({
                ios: 1,
                android: 2,
            }),
        },
        replyHeader: {
            flexDirection: 'row', justifyContent: 'space-between',
        },
        replyContainer: {
            backgroundColor: theme.centerChannelBg,
            borderWidth: 2,
            borderColor: theme.sidebarHeaderBg,
            borderRadius: 5,
            position: 'absolute',
            left: 8,
            right: 8,
            bottom: 82,
            zIndex: 2,
            paddingHorizontal: 10,
            paddingVertical: 8,
        },
        inputContainer: {
            flex: 1,
            flexDirection: 'column',
        },
        closeButton: {
            alignSelf: 'flex-end', fontSize: 16,
        },
        inputContentContainer: {
            alignItems: 'stretch',
            paddingTop: Platform.select({
                ios: 7,
                android: 0,
            }),
        },
        inputWrapper: {
            alignItems: 'flex-end',
            flexDirection: 'row',
            justifyContent: 'center',
            paddingBottom: 2,
            backgroundColor: theme.sidebarHeaderBg,
            borderTopWidth: 1,
            borderTopColor: changeOpacity(theme.centerChannelColor, 0.20),
        },
    };
});
