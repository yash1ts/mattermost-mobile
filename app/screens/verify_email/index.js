// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getTheme} from '@mm-redux/selectors/entities/preferences';

import VerifyEmail from './verify_email';
import {setDeepLinkURL} from '@actions/views/root';
import {getConfig} from '@mm-redux/selectors/entities/general';

function mapStateToProps(state, ownProps) {
    const verificationUrl = state.views.root.deepLinkURL || ownProps.deepLinkURL;
    return {
        verificationUrl,
        serverUrl: state.views.selectServer.serverUrl,
        siteUrl: getConfig(state).SiteURL,
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            setDeepLinkURL,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmail);
