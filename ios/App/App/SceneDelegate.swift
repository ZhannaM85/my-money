import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        // Capacitor only. The home-screen PWA never loads this delegate.
        // Reuse the storyboard window so a second UIWindow cannot hide this
        // root controller.
        let window = self.window ?? UIWindow(windowScene: windowScene)
        self.window = window
        window.rootViewController = MoneyBridgeViewController()
        window.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

/**
 * Capacitor-only. iOS 26 can draw a liquid-glass scroll pocket on a
 * scrollable WKWebView. The installed app is the Safari home-screen PWA,
 * which never runs this class — the PWA frost is fixed in AppShell.
 * Kept so a future native binary does not scroll the WebView under that
 * pocket. Hide each edge effect with `setHidden:`; key-value `setValue`
 * does not reach the WebKit wrapper.
 */
class MoneyBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        removeTopFrost()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        removeTopFrost()
        DispatchQueue.main.async { [weak self] in
            self?.removeTopFrost()
        }
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        removeTopFrost()
    }

    private func removeTopFrost() {
        guard let scrollView = webView?.scrollView else { return }
        scrollView.contentInsetAdjustmentBehavior = .never
        scrollView.bounces = false
        scrollView.alwaysBounceVertical = false
        scrollView.isScrollEnabled = false
        hideEdgeEffects(on: scrollView)
    }

    private func hideEdgeEffects(on scrollView: UIScrollView) {
        for name in ["topEdgeEffect", "bottomEdgeEffect", "leftEdgeEffect", "rightEdgeEffect"] {
            let getter = NSSelectorFromString(name)
            guard scrollView.responds(to: getter),
                  let effect = scrollView.perform(getter)?.takeUnretainedValue() as? NSObject
            else { continue }
            setHidden(true, on: effect)
        }
    }

    private func setHidden(_ hidden: Bool, on effect: NSObject) {
        let setter = NSSelectorFromString("setHidden:")
        guard effect.responds(to: setter) else { return }
        typealias Setter = @convention(c) (AnyObject, Selector, Bool) -> Void
        let fn = unsafeBitCast(effect.method(for: setter), to: Setter.self)
        fn(effect, setter, hidden)
    }
}
