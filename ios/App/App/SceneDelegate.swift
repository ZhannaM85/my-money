import UIKit
import WebKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = MoneyBridgeViewController()
        window?.makeKeyAndVisible()

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
 * #321 — iOS 26 composites a liquid-glass scroll-edge blur over the top of
 * WKWebView. The app name sits in that band, so it looks soft while text in
 * the page scroller stays sharp. Hiding the top edge effect keeps the name
 * as crisp as the page title. Key-value access no-ops on SDKs before iOS 26.
 */
class MoneyBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        hideTopScrollEdgeBlur()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        hideTopScrollEdgeBlur()
    }

    private func hideTopScrollEdgeBlur() {
        guard let scrollView = webView?.scrollView else { return }
        let edgeKey = "topEdgeEffect"
        guard scrollView.responds(to: NSSelectorFromString(edgeKey)) else { return }
        guard let effect = scrollView.value(forKey: edgeKey) as? NSObject else { return }
        effect.setValue(true, forKey: "hidden")
    }
}
