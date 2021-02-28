// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {resetUserPassword} from '@mm-redux/actions/users';
import ChangePassword from './change_password';
import {setDeepLinkURL} from '@actions/views/root';
import {getConfig} from '@mm-redux/selectors/entities/general';
import {getTheme} from '@mm-redux/selectors/entities/preferences';

function mapStateToProps(state, ownProps) {
    const deepLinkURL = state.views.root.deepLinkURL || ownProps.deepLinkURL;
    return {
        deepLinkURL,
        serverUrl: state.views.selectServer.serverUrl,
        siteUrl: getConfig(state).SiteURL,
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            resetUserPassword,
            setDeepLinkURL,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
