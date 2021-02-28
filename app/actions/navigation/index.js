// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Keyboard, Platform, Dimensions} from 'react-native';
import {Navigation} from 'react-native-navigation';
import merge from 'deepmerge';

import {Preferences} from '@mm-redux/constants';
import {getTheme} from '@mm-redux/selectors/entities/preferences';
import EventEmmiter from '@mm-redux/utils/event_emitter';

import {DeviceTypes, NavigationTypes} from '@constants';
import EphemeralStore from '@store/ephemeral_store';
import Store from '@store/store';

Navigation.setDefaultOptions({
    layout: {
        orientation: [DeviceTypes.IS_TABLET ? 'all' : 'portrait'],
    },
});

function getThemeFromState() {
    const state = Store.redux?.getState() || {};

    return getTheme(state);
}

export function resetToChannel(passProps = {}) {
    const theme = getThemeFromState();
    const drawerWidth = Dimensions.get('window').width;

    EphemeralStore.clearNavigationComponents();

    const stack = {
        children: [{
            component: {
                id: NavigationTypes.CHANNEL_SCREEN,
                name: NavigationTypes.CHANNEL_SCREEN,
                passProps,
                options: {
                    layout: {
                        componentBackgroundColor: theme.centerChannelBg,
                    },
                    statusBar: {
                        visible: true,
                    },
                    topBar: {
                        visible: false,
                        height: 0,
                        background: {
                            color: theme.sidebarHeaderBg,
                        },
                        backButton: {
                            visible: false,
                            color: theme.sidebarHeaderTextColor,
                        },
                    },
                },
            },
        }],
    };

    let platformStack = {stack};
    if (Platform.OS === 'android') {
        platformStack = {
            sideMenu: {
                left: {
                    component: {
                        id: 'MainSidebar',
                        name: 'MainSidebar',
                    },
                },
                center: {
                    stack,
                },
                right: {
                    component: {
                        id: 'SettingsSidebar',
                        name: 'SettingsSidebar',
                    },
                },
                options: {
                    sideMenu: {
                        left: {
                            width: drawerWidth,
                        },
                    },
                },
            },
        };
    }

    Navigation.setRoot({
        root: {
            ...platformStack,
        },
    });
}

export function resetToLogin(passProps = {}) {
    const theme = getThemeFromState();

    EphemeralStore.clearNavigationComponents();

    const stack = {
        children: [{
            component: {
                id: NavigationTypes.LOGIN_SCREEN,
                name: NavigationTypes.LOGIN_SCREEN,
                passProps,
                options: {
                    layout: {
                        componentBackgroundColor: theme.centerChannelBg,
                    },
                    statusBar: {
                        visible: true,
                    },
                    topBar: {
                        visible: false,
                        height: 0,
                        background: {
                            color: theme.sidebarHeaderBg,
                        },
                        backButton: {
                            visible: false,
                            color: theme.sidebarHeaderTextColor,
                        },
                    },
                },
            },
        }],
    };

    Navigation.setRoot({
        root: {
            ...{stack},
        },
    });
}

export function resetToSelectServer(allowOtherServers) {
    const theme = Preferences.THEMES.default;

    EphemeralStore.clearNavigationComponents();

    Navigation.setRoot({
        root: {
            stack: {
                children: [{
                    component: {
                        id: 'SelectServer',
                        name: 'SelectServer',
                        passProps: {
                            allowOtherServers,
                        },
                        options: {
                            layout: {
                                backgroundColor: theme.centerChannelBg,
                                componentBackgroundColor: theme.centerChannelBg,
                            },
                            statusBar: {
                                visible: true,
                            },
                            topBar: {
                                backButton: {
                                    color: theme.sidebarHeaderTextColor,
                                    title: '',
                                },
                                background: {
                                    color: theme.sidebarHeaderBg,
                                },
                                visible: false,
                                height: 0,
                            },
                        },
                    },
                }],
            },
        },
    });
}

export function resetToTeams(name, title, passProps = {}, options = {}) {
    const theme = getThemeFromState();
    const defaultOptions = {
        layout: {
            componentBackgroundColor: theme.centerChannelBg,
        },
        statusBar: {
            visible: true,
        },
        topBar: {
            visible: true,
            title: {
                color: theme.sidebarHeaderTextColor,
                text: title,
            },
            backButton: {
                color: theme.sidebarHeaderTextColor,
                title: '',
            },
            background: {
                color: theme.sidebarHeaderBg,
            },
        },
    };

    EphemeralStore.clearNavigationComponents();

    Navigation.setRoot({
        root: {
            stack: {
                children: [{
                    component: {
                        id: name,
                        name,
                        passProps,
                        options: merge(defaultOptions, options),
                    },
                }],
            },
        },
    });
}

export function goToScreen(name, title, passProps = {}, options = {}) {
    const theme = getThemeFromState();
    const componentId = EphemeralStore.getNavigationTopComponentId();
    const defaultOptions = {
        layout: {
            componentBackgroundColor: theme.centerChannelBg,
        },
        popGesture: true,
        sideMenu: {
            left: {enabled: false},
            right: {enabled: false},
        },
        topBar: {
            animate: true,
            visible: true,
            backButton: {
                color: theme.sidebarHeaderTextColor,
                title: '',
                testID: 'screen.back.button',
            },
            background: {
                color: theme.sidebarHeaderBg,
            },
            title: {
                color: theme.sidebarHeaderTextColor,
                text: title,
            },
        },
    };

    Navigation.push(componentId, {
        component: {
            id: name,
            name,
            passProps,
            options: merge(defaultOptions, options),
        },
    });
}

export function popTopScreen(screenId) {
    if (screenId) {
        Navigation.pop(screenId);
    } else {
        const componentId = EphemeralStore.getNavigationTopComponentId();
        Navigation.pop(componentId);
    }
}

export async function popToRoot() {
    const componentId = EphemeralStore.getNavigationTopComponentId();

    try {
        await Navigation.popToRoot(componentId);
    } catch (error) {
        // RNN returns a promise rejection if there are no screens
        // atop the root screen to pop. We'll do nothing in this case.
    }
}

export async function dismissAllModalsAndPopToRoot() {
    await dismissAllModals();
    await popToRoot();

    EventEmmiter.emit(NavigationTypes.NAVIGATION_DISMISS_AND_POP_TO_ROOT);
}

export function showModal(name, title, passProps = {}, options = {}) {
    const theme = getThemeFromState();
    const defaultOptions = {
        modalPresentationStyle: Platform.select({ios: 'pageSheet', android: 'none'}),
        layout: {
            componentBackgroundColor: theme.centerChannelBg,
        },
        statusBar: {
            visible: true,
        },
        topBar: {
            animate: true,
            visible: true,
            backButton: {
                color: theme.sidebarHeaderTextColor,
                title: '',
            },
            background: {
                color: theme.sidebarHeaderBg,
            },
            title: {
                color: theme.sidebarHeaderTextColor,
                text: title,
            },
            leftButtonColor: theme.sidebarHeaderTextColor,
            rightButtonColor: theme.sidebarHeaderTextColor,
        },
    };

    EphemeralStore.addNavigationModal(name);
    Navigation.showModal({
        stack: {
            children: [{
                component: {
                    id: name,
                    name,
                    passProps,
                    options: merge(defaultOptions, options),
                },
            }],
        },
    });
}

export function showModalOverCurrentContext(name, passProps = {}, options = {}) {
    const title = '';
    const animationsEnabled = (Platform.OS === 'android').toString();
    const defaultOptions = {
        modalPresentationStyle: 'overCurrentContext',
        layout: {
            backgroundColor: 'transparent',
            componentBackgroundColor: 'transparent',
        },
        topBar: {
            visible: false,
            height: 0,
        },
        animations: {
            showModal: {
                waitForRender: true,
                enabled: animationsEnabled,
                alpha: {
                    from: 0,
                    to: 1,
                    duration: 250,
                },
            },
            dismissModal: {
                enabled: animationsEnabled,
                alpha: {
                    from: 1,
                    to: 0,
                    duration: 250,
                },
            },
        },
    };
    const mergeOptions = merge(defaultOptions, options);

    showModal(name, title, passProps, mergeOptions);
}

export function showSearchModal(initialValue = '') {
    const name = 'Search';
    const title = '';
    const passProps = {initialValue};
    const options = {
        topBar: {
            visible: false,
            height: 0,
        },
        ...Platform.select({
            ios: {
                modalPresentationStyle: 'pageSheet',
            },
        }),
    };

    showModal(name, title, passProps, options);
}

export async function dismissModal(options = {}) {
    if (!EphemeralStore.hasModalsOpened()) {
        return;
    }

    const componentId = EphemeralStore.getNavigationTopComponentId();

    try {
        await Navigation.dismissModal(componentId, options);
        EphemeralStore.removeNavigationModal(componentId);
    } catch (error) {
        // RNN returns a promise rejection if there is no modal to
        // dismiss. We'll do nothing in this case.
    }
}

export async function dismissAllModals(options = {}) {
    if (!EphemeralStore.hasModalsOpened()) {
        return;
    }

    try {
        await Navigation.dismissAllModals(options);
        EphemeralStore.clearNavigationModals();
    } catch (error) {
        // RNN returns a promise rejection if there are no modals to
        // dismiss. We'll do nothing in this case.
    }
}

export function setButtons(componentId, buttons = {leftButtons: [], rightButtons: []}) {
    const options = {
        topBar: {
            ...buttons,
        },
    };

    mergeNavigationOptions(componentId, options);
}

export function mergeNavigationOptions(componentId, options) {
    Navigation.mergeOptions(componentId, options);
}

export function showOverlay(name, passProps, options = {}) {
    const defaultOptions = {
        layout: {
            backgroundColor: 'transparent',
            componentBackgroundColor: 'transparent',
        },
        overlay: {
            interceptTouchOutside: false,
        },
    };

    Navigation.showOverlay({
        component: {
            name,
            passProps,
            options: merge(defaultOptions, options),
        },
    });
}

export async function dismissOverlay(componentId) {
    try {
        await Navigation.dismissOverlay(componentId);
    } catch (error) {
        // RNN returns a promise rejection if there is no modal with
        // this componentId to dismiss. We'll do nothing in this case.
    }
}

export function openMainSideMenu() {
    if (Platform.OS === 'ios') {
        return;
    }

    const componentId = EphemeralStore.getNavigationTopComponentId();

    Keyboard.dismiss();
    Navigation.mergeOptions(componentId, {
        sideMenu: {
            left: {visible: true,
            },
        },
    });
}

export function closeMainSideMenu() {
    if (Platform.OS === 'ios') {
        return;
    }

    Keyboard.dismiss();
    Navigation.mergeOptions(NavigationTypes.CHANNEL_SCREEN, {
        sideMenu: {
            left: {visible: false},
        },
    });
}

export function enableMainSideMenu(enabled, visible = true) {
    if (Platform.OS === 'ios') {
        return;
    }

    Navigation.mergeOptions(NavigationTypes.CHANNEL_SCREEN, {
        sideMenu: {
            left: {enabled, visible},
        },
    });
}

export function openSettingsSideMenu() {
    if (Platform.OS === 'ios') {
        return;
    }

    Keyboard.dismiss();
    Navigation.mergeOptions(NavigationTypes.CHANNEL_SCREEN, {
        sideMenu: {
            right: {visible: true},
        },
    });
}

export function closeSettingsSideMenu() {
    if (Platform.OS === 'ios') {
        return;
    }

    Keyboard.dismiss();
    Navigation.mergeOptions(NavigationTypes.CHANNEL_SCREEN, {
        sideMenu: {
            right: {visible: false},
        },
    });
}
