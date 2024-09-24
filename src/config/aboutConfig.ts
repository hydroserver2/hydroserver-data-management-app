export interface AboutUsCard {
  title: string
  titleIcon: string
  text: string
  btnText: string
  btnColor: string
  btnHref?: string
  btnTarget?: string
  btnComponent?: string
}

export interface AboutUsConfig {
  title: string
  subTitle: string
  columns: number
  cards: AboutUsCard[]
}

/**
 * Configurations for the /about page of HydroServer.
 * This page is intended to be a place where you can provide information
 * and links specific to your instance of HydroServer and your organization.
 * Examples are commented out below.
 */
export const aboutUs: AboutUsConfig = {
  title: 'About us',
  subTitle: '',
  // 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto.',
  columns: 4, // Number of columns between 1 and 4
  cards: [
    // {
    //   title: 'Email Us',
    //   titleIcon: 'mdi-email',
    //   text: `The HydroServer software is under development at the
    //     Utah Water Research Laboratory at Utah State University through
    //     support from the National Oceanic and Atmospheric Administration’s
    //     (NOAA) Cooperative Institute for Research to Operations in Hydrology (CIROH).
    //     Please contact Jeff Horsburgh at jeff.horsburgh@usu.edu`,
    //   btnText: 'Send an email',
    //   btnColor: 'secondary',
    //   btnHref: 'mailto:jeff.horsburgh@usu.edu',
    // },
    // {
    //   title: 'Connect With Us on GitHub',
    //   titleIcon: 'mdi-github',
    //   text: `All of our software development activities are open source and
    //     available on GitHub. You can submit bugs or issues and follow our software
    //     development activities on our repo.`,
    //   btnText: 'Go to GitHub',
    //   btnColor: 'primary',
    //   btnHref: 'https://github.com/hydroserver2/hydroserver',
    //   btnTarget: '_blank',
    // },
    // {
    //   title: 'Lorem ipsum dolor sit amet',
    //   titleIcon: 'mdi-cheese',
    //   text: `ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui.`,
    //   btnText: 'Go to GitHub',
    //   btnColor: 'blue-grey',
    //   btnHref: 'https://github.com/hydroserver2/hydroserver',
    //   btnTarget: '_blank',
    // },
    // {
    //   title: 'consectetur, adipisci',
    //   titleIcon: 'mdi-taco',
    //   text: `Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates .`,
    //   btnText: 'Go to GitHub',
    //   btnColor: 'orange',
    //   btnHref: 'https://github.com/hydroserver2/hydroserver',
    //   btnTarget: '_blank',
    // },
    // {
    //   title: 'voluptatibus maiores',
    //   titleIcon: 'mdi-cat',
    //   text: `Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat..`,
    //   btnText: 'Go to GitHub',
    //   btnColor: 'indigo',
    //   btnHref: 'https://github.com/hydroserver2/hydroserver',
    //   btnTarget: '_blank',
    // },
  ],
}
