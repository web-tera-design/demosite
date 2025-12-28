<!doctype html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
    <div class="l-mv-header-wrapper">
        <?php if (!is_page('thanks')): ?>
            <div class="l-mv-header-bg"></div>
        <?php endif; ?>
        <header class="l-header">
            <div class="l-header__inner l-section__inner l-section__inner--narrow">
                <div class="l-header-wrapper">
                    <div class="l-header__logo">
                        <a href="<?php echo esc_url(home_url('/')); ?>" class="l-header__logo-link">
                            <img src="<?php echo get_template_directory_uri(); ?>" alt="" />
                        </a>
                    </div>
                    <nav class="l-header__nav" aria-label="ヘッダーナビゲーション">
                        <ul class="l-header__list">
                            <li class="l-header__item">
                                <a href="<?php echo is_front_page() ? '#service' : esc_url(home_url('/#service')); ?>" class="l-header__link">
                                    <span class="l-header__link-text"></span>
                                    <span class="l-header__link-subtext"></span>
                                </a>
                            </li>
                            <li class="l-header__item">
                                <a href="<?php echo is_front_page() ? '#support' : esc_url(home_url('/#support')); ?>" class="l-header__link">
                                    <span class="l-header__link-text"></span>
                                    <span class="l-header__link-subtext"></span>
                                </a>
                            </li>
                            <li class="l-header__item">
                                <a href="<?php echo is_front_page() ? '#feature' : esc_url(home_url('/#feature')); ?>" class="l-header__link">
                                    <span class="l-header__link-text"></span>
                                    <span class="l-header__link-subtext"></span>
                                </a>
                            </li>
                            <li class="l-header__item">
                                <a href="<?php echo is_front_page() ? '#voice' : esc_url(home_url('/#voice')); ?>" class="l-header__link">
                                    <span class="l-header__link-text"></span>
                                    <span class="l-header__link-subtext"></span>
                                </a>
                            </li>
                            <li class="l-header__item">
                                <a href="<?php echo is_front_page() ? '#faq' : esc_url(home_url('/#faq')); ?>" class="l-header__link">
                                    <span class="l-header__link-text"></span>
                                    <span class="l-header__link-subtext"></span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div class="c-cta--small">
                    <a href="<?php echo is_front_page() ? '#contact' : esc_url(home_url('/#contact')); ?>" class="c-cta--small-link">
                        <span class="c-cta--small-text"></span>
                        <span class="c-cta--small-arrow">
                        </span>
                    </a>
                </div>
            </div>
        </header>

        <button class="c-drawer-icon" aria-label="メニューを開く">
            <span class="c-drawer-icon__bar"></span>
            <span class="c-drawer-icon__bar"></span>
        </button>

        <div class="c-drawer-overlay"></div>
        <div class="c-drawer">
            <div class="c-drawer__content">
                <ul class="c-drawer__list">
                    <li class="c-drawer__item">
                        <a href="<?php echo is_front_page() ? '#service' : esc_url(home_url('/#service')); ?>" class="c-drawer__link">
                            <span class="c-drawer__text"></span>
                            <span class="c-drawer__subtext"></span>
                        </a>
                    </li>
                    <li class="c-drawer__item">
                        <a href="<?php echo is_front_page() ? '#support' : esc_url(home_url('/#support')); ?>" class="c-drawer__link">
                            <span class="c-drawer__text"></span>
                            <span class="c-drawer__subtext"></span>
                        </a>
                    </li>
                    <li class="c-drawer__item">
                        <a href="<?php echo is_front_page() ? '#feature' : esc_url(home_url('/#feature')); ?>" class="c-drawer__link">
                            <span class="c-drawer__text"></span>
                            <span class="c-drawer__subtext"></span>
                        </a>
                    </li>
                    <li class="c-drawer__item">
                        <a href="<?php echo is_front_page() ? '#voice' : esc_url(home_url('/#voice')); ?>" class="c-drawer__link">
                            <span class="c-drawer__text"></span>
                            <span class="c-drawer__subtext"></span>
                        </a>
                    </li>
                    <li class="c-drawer__item">
                        <a href="<?php echo is_front_page() ? '#faq' : esc_url(home_url('/#faq')); ?>" class="c-drawer__link">
                            <span class="c-drawer__text"></span>
                            <span class="c-drawer__subtext"></span>
                        </a>
                    </li>
                </ul>
                <div class="c-drawer__cta">
                    <a href="<?php echo is_front_page() ? '#contact' : esc_url(home_url('/#contact')); ?>" class="c-cta--small-link">
                        <span class="c-cta--small-text"></span>
                        <span class="c-cta--small-arrow">
                        </span>
                    </a>
                </div>
            </div>
        </div>