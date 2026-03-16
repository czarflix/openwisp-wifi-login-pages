/* eslint-disable react/no-array-index-key */
import "./index.css";

import PropTypes from "prop-types";
import React from "react";
import {Link} from "react-router-dom";
import isInternalLink from "../../utils/check-internal-links";
import getAssetPath from "../../utils/get-asset-path";
import getText from "../../utils/get-text";
import shouldLinkBeShown from "../../utils/should-link-be-shown";
import getHtml from "../../utils/get-html";

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menu: false,
      stickyMsg: true,
    };
    this.handleHamburger = this.handleHamburger.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  handleHamburger() {
    this.setState(({menu}) => ({
      menu: !menu,
    }));
  }

  handleKeyUp(event) {
    if (event.keyCode === 13) {
      this.handleHamburger();
    }
  }

  getStickyMsg = () => {
    const {stickyMsg} = this.state;
    const {header, language} = this.props;
    const {sticky_html: stickyHtml} = header;
    return stickyMsg && stickyHtml ? (
      <div className="sticky-container" role="banner">
        <div className="inner">
          {getHtml(stickyHtml, language, "sticky-msg")}
          <button
            type="button"
            className="close-sticky-btn"
            onClick={() => this.setState({stickyMsg: false})}
          >
            ✖
          </button>
        </div>
      </div>
    ) : null;
  };

  getVisibleLinks = () => {
    const {header, isAuthenticated, userData} = this.props;
    return (header.links || []).filter((link) =>
      shouldLinkBeShown(link, isAuthenticated, userData),
    );
  };

  renderHeaderLinks() {
    const {language, orgSlug, location, isAuthenticated} = this.props;
    const {pathname} = location;
    const internalLinks = [`/${orgSlug}/login`, `/${orgSlug}/registration`];

    return this.getVisibleLinks().map((link, index) => {
      const resolvedUrl = link.url.replace("{orgSlug}", orgSlug);
      const isInternal =
        isInternalLink(link.url) &&
        (internalLinks.indexOf(resolvedUrl) < 0 || !isAuthenticated);
      const activeClass = pathname === resolvedUrl ? "active" : "";
      const linkClassName = `header-link header-link-${index + 1} ${activeClass} button`;

      if (isInternal) {
        return (
          <Link className={linkClassName} to={resolvedUrl} key={resolvedUrl}>
            {getText(link.text, language)}
          </Link>
        );
      }

      return (
        <a
          href={isInternalLink(link.url) ? resolvedUrl : link.url}
          className={linkClassName}
          target={isInternal ? undefined : "_blank"}
          rel={isInternal ? undefined : "noreferrer noopener"}
          key={resolvedUrl}
        >
          {getText(link.text, language)}
        </a>
      );
    });
  }

  renderLanguageButtons() {
    const {languages, language, setLanguage} = this.props;

    return languages.map((lang) => (
      <button
        type="button"
        className={`${
          language === lang.slug ? "active " : ""
        }header-language-btn header-language-btn-${lang.slug}`}
        key={lang.slug}
        onClick={() => setLanguage(lang.slug)}
      >
        {lang.text}
      </button>
    ));
  }

  render() {
    const {menu} = this.state;
    const {header, orgSlug, language} = this.props;
    const {logo, second_logo: secondLogo} = header;
    const navStateClass = menu ? "menu-open" : "menu-closed";

    return (
      <>
        <div className="header-container">
          <div className="header-row-1">
            <div className="header-row-1-inner">
              <div className="header-branding">
                <div className="header-logo-div">
                  {logo?.url ? (
                    <Link to={`/${orgSlug}`}>
                      <img
                        src={getAssetPath(orgSlug, logo.url)}
                        alt={logo.alternate_text}
                        className="header-logo-image"
                      />
                    </Link>
                  ) : null}
                </div>
                {secondLogo?.url ? (
                  <div className="header-logo-2">
                    <img
                      src={getAssetPath(orgSlug, secondLogo.url)}
                      alt={secondLogo.alternate_text || ""}
                      className="header-logo-image"
                    />
                  </div>
                ) : null}
              </div>

              <div className="header-controls">
                <button
                  type="button"
                  className={`header-hamburger ${menu ? "is-open" : ""}`}
                  onClick={this.handleHamburger}
                  onKeyUp={this.handleKeyUp}
                  aria-label={getText({en: "Menu Button"}, language)}
                  aria-expanded={menu}
                >
                  <div className={`${menu ? "rot45" : ""}`} />
                  <div className={`${menu ? "rot-45" : ""}`} />
                  <div className={`${menu ? "opacity-hidden" : ""}`} />
                </button>
              </div>
            </div>
          </div>
          <div className={`header-row-2 header-navigation ${navStateClass}`}>
            <div className="header-row-2-inner">
              <div className="header-link-group">
                {this.renderHeaderLinks()}
              </div>
              <div className="header-language-group">
                {this.renderLanguageButtons()}
              </div>
            </div>
          </div>
        </div>
        {this.getStickyMsg()}
      </>
    );
  }
}

Header.propTypes = {
  header: PropTypes.object.isRequired,
  languages: PropTypes.array.isRequired,
  language: PropTypes.string.isRequired,
  orgSlug: PropTypes.string.isRequired,
  setLanguage: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool,
  userData: PropTypes.object,
};

Header.defaultProps = {
  isAuthenticated: false,
  userData: {},
};
