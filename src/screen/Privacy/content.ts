/**
 * Privacy policy sections — kept here so the diff for legal updates is
 * obvious and the screen file stays small.
 *
 * Order is rendered top-to-bottom. The new "Advertising / Consent / Analytics
 * / Children's policy" sections were added when AdMob + UMP + Firebase
 * Analytics were integrated.
 */

export interface PrivacySection {
  readonly title: string;
  readonly body: string;
}

export const PRIVACY_SECTIONS: readonly PrivacySection[] = [
  {
    title: 'Privacy Policy',
    body:
      'Uk49sresults.com built the UK 49s Results app as an Ad Supported app. ' +
      'This SERVICE is provided by Uk49sresults.com at no cost and is intended for use as is.\n' +
      'This page is used to inform visitors regarding our policies with the collection, use, ' +
      'and disclosure of Personal Information if anyone decided to use our Service.\n' +
      'If you choose to use our Service, then you agree to the collection and use of information ' +
      'in relation to this policy. The Personal Information that we collect is used for providing ' +
      'and improving the Service. We will not use or share your information with anyone except as ' +
      'described in this Privacy Policy.\n' +
      'The terms used in this Privacy Policy have the same meanings as in our Terms and ' +
      'Conditions, which is accessible at UK 49s Results unless otherwise defined in this ' +
      'Privacy Policy.',
  },
  {
    title: 'Information Collection and Use',
    body:
      'For a better experience, while using our Service, we may require you to provide us with ' +
      'certain personally identifiable information, including but not limited to cookies. The ' +
      'information that we request will be retained by us and used as described in this privacy policy.',
  },
  {
    title: 'Advertising',
    body:
      'We display ads in the app via Google AdMob. AdMob may collect device identifiers ' +
      '(such as your advertising ID and IP address), approximate location, and ad-interaction ' +
      'events in order to deliver and measure ads. Whether the ads you see are personalised or ' +
      'non-personalised depends on the consent choice you make on first launch — you can change ' +
      "this any time from Settings → \"Manage ad preferences\". Learn more at Google's Partner " +
      'Policies (policies.google.com/technologies/partner-sites) and the AdMob privacy page.',
  },
  {
    title: 'Consent (EEA / UK)',
    body:
      'If you are in the European Economic Area or the United Kingdom, we use the Google User ' +
      'Messaging Platform (UMP) to ask for your consent before serving personalised ads. Your ' +
      'choice is stored on this device and respected for every ad request we make. You can ' +
      're-open the consent form any time from Settings → "Manage ad preferences".',
  },
  {
    title: 'Analytics',
    body:
      'We use Firebase Analytics (a Google service) to understand how the app is used in aggregate — ' +
      'screens visited, features tapped, and the rate at which ads are shown, skipped, or earn ' +
      'rewards. Firebase may collect a device identifier, IP address, and approximate location. ' +
      'We do not use analytics data to identify you individually.',
  },
  {
    title: "Children's Privacy",
    body:
      'This app is intended for users aged 18 or over. On first launch you are asked to confirm ' +
      "your age — if you indicate that you are under 18 you are shown an end-of-app screen, no " +
      'ads are ever served, and no ad SDK is initialised. We do not knowingly collect personal ' +
      'information from anyone under 18. If you are a parent or guardian and believe a child has ' +
      'somehow provided information to us, please contact us so we can take action.',
  },
  {
    title: 'Log Data',
    body:
      'We want to inform you that whenever you use our Service, in a case of an error in the app ' +
      'we collect data and information (through third party products) on your phone called Log Data. ' +
      'This Log Data may include information such as your device Internet Protocol ("IP") address, ' +
      'device name, operating system version, the configuration of the app when utilizing our ' +
      'Service, the time and date of your use of the Service, and other statistics.',
  },
  {
    title: 'Cookies',
    body:
      'Cookies are files with a small amount of data that are commonly used as anonymous unique ' +
      "identifiers. These are sent to your browser from the websites that you visit and are stored " +
      "on your device's internal memory.\nThis Service does not use these \"cookies\" explicitly. " +
      'However, the app may use third party code and libraries that use "cookies" to collect ' +
      'information and improve their services. You have the option to either accept or refuse these ' +
      'cookies and know when a cookie is being sent to your device. If you choose to refuse our ' +
      'cookies, you may not be able to use some portions of this Service.',
  },
  {
    title: 'Service Providers',
    body:
      'We may employ third-party companies and individuals due to the following reasons:\n' +
      '  •  To facilitate our Service;\n' +
      '  •  To provide the Service on our behalf;\n' +
      '  •  To perform Service-related services\n' +
      '  •  To assist us in analyzing how our Service is used.\n' +
      'We want to inform users of this Service that these third parties have access to your ' +
      'Personal Information. The reason is to perform the tasks assigned to them on our behalf. ' +
      'However, they are obligated not to disclose or use the information for any other purpose.',
  },
  {
    title: 'Security',
    body:
      'We value your trust in providing us your Personal Information, thus we are striving to use ' +
      'commercially acceptable means of protecting it. But remember that no method of transmission ' +
      'over the internet, or method of electronic storage is 100% secure and reliable, and we ' +
      'cannot guarantee its absolute security.',
  },
  {
    title: 'Links to Other Sites',
    body:
      'This Service may contain links to other sites. If you click on a third-party link, you will ' +
      'be directed to that site. Note that these external sites are not operated by us. Therefore, ' +
      'we strongly advise you to review the Privacy Policy of these websites. We have no control ' +
      'over and assume no responsibility for the content, privacy policies, or practices of any ' +
      'third-party sites or services.',
  },
  {
    title: 'Changes to This Privacy Policy',
    body:
      'We may update our Privacy Policy from time to time. Thus, you are advised to review this ' +
      'page periodically for any changes. We will notify you of any changes by posting the new ' +
      'Privacy Policy on this page.',
  },
  {
    title: 'Contact Us',
    body:
      'If you have any questions or suggestions about our Privacy Policy, do not hesitate to ' +
      'contact us at 49sresult@gmail.com.',
  },
];
