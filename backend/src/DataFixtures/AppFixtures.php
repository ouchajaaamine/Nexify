<?php

namespace App\DataFixtures;

use App\Entity\Affiliate;
use App\Entity\Campaign;
use App\Entity\Metric;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $passwordHasher) {}

    /**
     * Load sample data for the app.
     *
     * This *bjectManager $manager The manager to save the data to the database.
     */
    public function load(ObjectManager $manager): void
    {
        $user = new User();
        $user->setEmail('admin@example.com');
        $user->setPassword($this->passwordHasher->hashPassword($user, 'password'));
        $user->setRoles(['ROLE_ADMIN']);

        $manager->persist($user);

        $campaignsData = [
            ['name' => 'Electronics & Gadgets Launch', 'budget' => '5000.00', 'startDate' => '2025-06-01', 'endDate' => '2025-08-31', 'status' => 'active'],
            ['name' => 'Winter Apparel Collection', 'budget' => '3000.00', 'startDate' => '2025-12-01', 'endDate' => '2025-12-31', 'status' => 'draft'],
            ['name' => 'Academic Resources Platform', 'budget' => '7500.00', 'startDate' => '2025-08-15', 'endDate' => '2025-09-15', 'status' => 'active'],
            ['name' => 'Fashion Brand Relaunch', 'budget' => '12000.00', 'startDate' => '2025-03-01', 'endDate' => '2025-05-31', 'status' => 'completed'],
            ['name' => 'Summer Travel Deals', 'budget' => '8000.00', 'startDate' => '2025-06-15', 'endDate' => '2025-07-31', 'status' => 'active'],
            ['name' => 'Home Decor Collection', 'budget' => '4500.00', 'startDate' => '2025-09-01', 'endDate' => '2025-10-31', 'status' => 'draft'],
            ['name' => 'Fitness Challenge Program', 'budget' => '6000.00', 'startDate' => '2025-01-01', 'endDate' => '2025-02-28', 'status' => 'active'],
            ['name' => 'Kids Toy Drive', 'budget' => '2000.00', 'startDate' => '2025-11-01', 'endDate' => '2025-12-15', 'status' => 'pending'],
            ['name' => 'Sustainable Living Expo', 'budget' => '10000.00', 'startDate' => '2025-04-01', 'endDate' => '2025-04-30', 'status' => 'completed'],
            ['name' => 'Pet Care Product Launch', 'budget' => '3500.00', 'startDate' => '2025-07-01', 'endDate' => '2025-08-15', 'status' => 'active'],
            ['name' => 'Gourmet Food Festival', 'budget' => '9000.00', 'startDate' => '2025-10-01', 'endDate' => '2025-10-15', 'status' => 'draft'],
            ['name' => 'Digital Marketing Workshop', 'budget' => '2500.00', 'startDate' => '2025-03-10', 'endDate' => '2025-03-12', 'status' => 'completed'],
            ['name' => 'Art Exhibition Promotion', 'budget' => '5500.00', 'startDate' => '2025-05-01', 'endDate' => '2025-05-31', 'status' => 'active'],
            ['name' => 'Charity Gala Event', 'budget' => '15000.00', 'startDate' => '2025-11-20', 'endDate' => '2025-11-20', 'status' => 'pending'],
            ['name' => 'New Year Sales Campaign', 'budget' => '7000.00', 'startDate' => '2025-12-26', 'endDate' => '2026-01-05', 'status' => 'draft'],
            ['name' => 'Home Improvement Tools', 'budget' => '8500.00', 'startDate' => '2025-04-01', 'endDate' => '2025-06-30', 'status' => 'active'],
            ['name' => 'Health & Fitness App', 'budget' => '6200.00', 'startDate' => '2025-01-15', 'endDate' => '2025-03-15', 'status' => 'completed'],
            ['name' => 'E-commerce Platform Sale', 'budget' => '25000.00', 'startDate' => '2025-11-20', 'endDate' => '2025-11-30', 'status' => 'draft'],
            ['name' => 'Digital Services Bundle', 'budget' => '18000.00', 'startDate' => '2025-12-01', 'endDate' => '2025-12-02', 'status' => 'draft'],
            ['name' => 'Premium Beauty Products', 'budget' => '4500.00', 'startDate' => '2025-02-01', 'endDate' => '2025-02-14', 'status' => 'completed'],
            ['name' => 'Family Entertainment Package', 'budget' => '3200.00', 'startDate' => '2025-03-20', 'endDate' => '2025-04-20', 'status' => 'completed'],
            ['name' => 'Professional Development Courses', 'budget' => '5500.00', 'startDate' => '2025-05-01', 'endDate' => '2025-05-12', 'status' => 'active'],
            ['name' => 'Technology Solutions Suite', 'budget' => '4800.00', 'startDate' => '2025-06-01', 'endDate' => '2025-06-16', 'status' => 'active'],
            ['name' => 'Outdoor Adventure Gear', 'budget' => '3800.00', 'startDate' => '2025-06-20', 'endDate' => '2025-07-04', 'status' => 'active'],
            ['name' => 'Creative Arts Supplies', 'budget' => '2900.00', 'startDate' => '2025-10-15', 'endDate' => '2025-10-31', 'status' => 'active'],
            ['name' => 'Gourmet Food Delivery', 'budget' => '4100.00', 'startDate' => '2025-11-15', 'endDate' => '2025-11-28', 'status' => 'draft'],
        ];

        $campaigns = [];
        foreach ($campaignsData as $data) {
            $campaign = new Campaign();
            $campaign->setName($data['name']);
            $campaign->setBudget($data['budget']);
            $campaign->setStartDate(new \DateTimeImmutable($data['startDate']));
            $campaign->setEndDate(new \DateTimeImmutable($data['endDate']));
            $campaign->setStatus($data['status']);
            $manager->persist($campaign);
            $campaigns[] = $campaign;
        }

        $affiliatesData = [
            ['name' => 'Tech Review Network', 'email' => 'contact@techreviewnetwork.com', 'campaigns' => [0, 2]],
            ['name' => 'Fashion Industry Blog', 'email' => 'partnerships@fashionindustryblog.com', 'campaigns' => [1, 3]],
            ['name' => 'Home Improvement Hub', 'email' => 'collaborate@homeimprovementhub.com', 'campaigns' => [15]],
            ['name' => 'Education Technology Partners', 'email' => 'deals@edtechpartners.net', 'campaigns' => [2, 0]],
            ['name' => 'Health & Wellness Network', 'email' => 'affiliates@healthwellnessnetwork.com', 'campaigns' => [16, 15]],
            ['name' => 'Digital Commerce Alliance', 'email' => 'marketing@digitalcommercealliance.com', 'campaigns' => [0, 1, 3]],
            ['name' => 'Business Solutions Group', 'email' => 'partners@businesssolutionsgroup.com', 'campaigns' => [2, 15, 16]],
            ['name' => 'Lifestyle & Technology', 'email' => 'business@lifestyletechnology.com', 'campaigns' => [3, 16]],
            ['name' => 'E-commerce Solutions Pro', 'email' => 'deals@ecommercesolutionspro.com', 'campaigns' => [1, 17, 18, 25]],
            ['name' => 'Beauty & Lifestyle Magazine', 'email' => 'partnerships@beautylifestylemag.com', 'campaigns' => [19]],
            ['name' => 'Family & Entertainment Network', 'email' => 'affiliates@familyentertainmentnetwork.com', 'campaigns' => [20, 21, 22]],
            ['name' => 'Tech Solutions Review', 'email' => 'sponsorships@techsolutionsreview.com', 'campaigns' => [0, 22]],
            ['name' => 'Adventure & Outdoor Hub', 'email' => 'collaborate@adventureoutdoorhub.com', 'campaigns' => [15, 23]],
            ['name' => 'Creative Arts Community', 'email' => 'business@creativeartscommunity.com', 'campaigns' => [24]],
            ['name' => 'Gourmet Dining Network', 'email' => 'partnerships@gourmetdiningnetwork.com', 'campaigns' => [25, 20]],
            ['name' => 'Professional Development Institute', 'email' => 'advertising@professionaldevelopmentinst.com', 'campaigns' => [16, 19, 21]],
        ];

        foreach ($affiliatesData as $data) {
            $affiliate = new Affiliate();
            $affiliate->setName($data['name']);
            $affiliate->setEmail($data['email']);
            foreach ($data['campaigns'] as $campaignIndex) {
                if (isset($campaigns[$campaignIndex])) {
                    $affiliate->addCampaign($campaigns[$campaignIndex]);
                }
            }
            $manager->persist($affiliate);
        }

        $metric1 = new Metric();
        $metric1->setName('Product Launch Traffic');
        $metric1->setValue('2850.00');
        $metric1->setClicks(2850);
        $metric1->setConversions(57);
        $metric1->setRevenue('2850.00');
        $metric1->setNotes('Initial product launch website visits');
        $metric1->setTimestamp(new \DateTimeImmutable('2025-06-02'));
        $metric1->setCampaign($campaigns[0]);
        $manager->persist($metric1);

        $metric2 = new Metric();
        $metric2->setName('Device Sales');
        $metric2->setValue('420.00');
        $metric2->setClicks(1890);
        $metric2->setConversions(38);
        $metric2->setRevenue('420.00');
        $metric2->setNotes('Electronic device purchases from campaign');
        $metric2->setTimestamp(new \DateTimeImmutable('2025-06-20'));
        $metric2->setCampaign($campaigns[0]);
        $manager->persist($metric2);

        $metric3 = new Metric();
        $metric3->setName('Gadget Revenue');
        $metric3->setValue('18750.00');
        $metric3->setClicks(6200);
        $metric3->setConversions(145);
        $metric3->setRevenue('18750.00');
        $metric3->setNotes('Total revenue from electronics and gadgets');
        $metric3->setTimestamp(new \DateTimeImmutable('2025-06-25'));
        $metric3->setCampaign($campaigns[0]);
        $manager->persist($metric3);

        $metric4 = new Metric();
        $metric4->setName('Tech Reviews');
        $metric4->setValue('125.00');
        $metric4->setClicks(125);
        $metric4->setConversions(25);
        $metric4->setRevenue('125.00');
        $metric4->setNotes('Product reviews and testimonials shared');
        $metric4->setTimestamp(new \DateTimeImmutable('2025-07-01'));
        $metric4->setCampaign($campaigns[0]);
        $manager->persist($metric4);

        // Campaign 2 Metrics (Winter Apparel Collection)
        $metric5 = new Metric();
        $metric5->setName('Seasonal Catalog Views');
        $metric5->setValue('3450.00');
        $metric5->setClicks(3450);
        $metric5->setConversions(69);
        $metric5->setRevenue('3450.00');
        $metric5->setNotes('Winter clothing catalog page views');
        $metric5->setTimestamp(new \DateTimeImmutable('2025-12-05'));
        $metric5->setCampaign($campaigns[1]);
        $manager->persist($metric5);

        $metric6 = new Metric();
        $metric6->setName('Conversion Analytics');
        $metric6->setValue('18.75');
        $metric6->setClicks(1840);
        $metric6->setConversions(34);
        $metric6->setRevenue('1840.00');
        $metric6->setNotes('Percentage of visitors who made purchases');
        $metric6->setTimestamp(new \DateTimeImmutable('2025-12-10'));
        $metric6->setCampaign($campaigns[1]);
        $manager->persist($metric6);

        $metric7 = new Metric();
        $metric7->setName('Winter Collection Sales');
        $metric7->setValue('2400.00');
        $metric7->setClicks(1200);
        $metric7->setConversions(48);
        $metric7->setRevenue('2400.00');
        $metric7->setNotes('Revenue from winter apparel and accessories');
        $metric7->setTimestamp(new \DateTimeImmutable('2025-12-20'));
        $metric7->setCampaign($campaigns[1]);
        $manager->persist($metric7);

        // Campaign 3 Metrics (Academic Resources Platform)
        $metric8 = new Metric();
        $metric8->setName('Student Account Creations');
        $metric8->setValue('675.00');
        $metric8->setClicks(675);
        $metric8->setConversions(135);
        $metric8->setRevenue('675.00');
        $metric8->setNotes('New student accounts registered');
        $metric8->setTimestamp(new \DateTimeImmutable('2025-08-20'));
        $metric8->setCampaign($campaigns[2]);
        $manager->persist($metric8);

        $metric9 = new Metric();
        $metric9->setName('Resource Downloads');
        $metric9->setValue('480.00');
        $metric9->setClicks(960);
        $metric9->setConversions(96);
        $metric9->setRevenue('480.00');
        $metric9->setNotes('Educational materials downloaded');
        $metric9->setTimestamp(new \DateTimeImmutable('2025-08-25'));
        $metric9->setCampaign($campaigns[2]);
        $manager->persist($metric9);

        $metric10 = new Metric();
        $metric10->setName('Academic Inquiries');
        $metric10->setValue('270.00');
        $metric10->setClicks(540);
        $metric10->setConversions(54);
        $metric10->setRevenue('270.00');
        $metric10->setNotes('Contact forms from educational institutions');
        $metric10->setTimestamp(new \DateTimeImmutable('2025-09-01'));
        $metric10->setCampaign($campaigns[2]);
        $manager->persist($metric10);

        $metric10a = new Metric();
        $metric10a->setName('Education Platform Revenue');
        $metric10a->setValue('14200.00');
        $metric10a->setNotes('Revenue from subscriptions and resource sales');
        $metric10a->setTimestamp(new \DateTimeImmutable('2025-09-10'));
        $metric10a->setCampaign($campaigns[2]);
        $manager->persist($metric10a);
        $campaigns[2]->calculateRevenueAndRoi();

        // Campaign 4 Metrics (Fashion Brand Relaunch)
        $metric11 = new Metric();
        $metric11->setName('Brand Awareness Coverage');
        $metric11->setValue('95.00');
        $metric11->setClicks(1900);
        $metric11->setConversions(19);
        $metric11->setRevenue('95.00');
        $metric11->setNotes('Media mentions and brand coverage');
        $metric11->setTimestamp(new \DateTimeImmutable('2025-03-15'));
        $metric11->setCampaign($campaigns[3]);
        $manager->persist($metric11);

        $metric12 = new Metric();
        $metric12->setName('Fashion Collection Revenue');
        $metric12->setValue('31200.00');
        $metric12->setNotes('Sales from relaunched fashion line');
        $metric12->setTimestamp(new \DateTimeImmutable('2025-04-01'));
        $metric12->setCampaign($campaigns[3]);
        $manager->persist($metric12);

        $metric13 = new Metric();
        $metric13->setName('Social Media Growth');
        $metric13->setValue('1850.00');
        $metric13->setClicks(18500);
        $metric13->setConversions(185);
        $metric13->setRevenue('1850.00');
        $metric13->setNotes('New followers from brand relaunch campaign');
        $metric13->setTimestamp(new \DateTimeImmutable('2025-04-15'));
        $metric13->setCampaign($campaigns[3]);
        $manager->persist($metric13);
        $campaigns[3]->calculateRevenueAndRoi();

        // Campaign 5 Metrics (Home Improvement Tools)
        $metric14 = new Metric();
        $metric14->setName('Tool Sales Performance');
        $metric14->setValue('435.00');
        $metric14->setClicks(870);
        $metric14->setConversions(87);
        $metric14->setRevenue('435.00');
        $metric14->setNotes('Power tools and equipment purchases');
        $metric14->setTimestamp(new \DateTimeImmutable('2025-04-10'));
        $metric14->setCampaign($campaigns[15]);
        $manager->persist($metric14);

        $metric15 = new Metric();
        $metric15->setName('DIY Project Leads');
        $metric15->setValue('234.00');
        $metric15->setClicks(1170);
        $metric15->setConversions(117);
        $metric15->setRevenue('234.00');
        $metric15->setNotes('Contact forms from homeowners');
        $metric15->setTimestamp(new \DateTimeImmutable('2025-05-01'));
        $metric15->setCampaign($campaigns[15]);
        $manager->persist($metric15);

        $metric16 = new Metric();
        $metric16->setName('Workshop Registrations');
        $metric16->setValue('127.50');
        $metric16->setClicks(510);
        $metric16->setConversions(51);
        $metric16->setRevenue('127.50');
        $metric16->setNotes('Signups for home improvement training');
        $metric16->setTimestamp(new \DateTimeImmutable('2025-05-15'));
        $metric16->setCampaign($campaigns[15]);
        $manager->persist($metric16);

        $metric16a = new Metric();
        $metric16a->setName('Home Improvement Revenue');
        $metric16a->setValue('16800.00');
        $metric16a->setNotes('Revenue from tools, materials, and services');
        $metric16a->setTimestamp(new \DateTimeImmutable('2025-06-01'));
        $metric16a->setCampaign($campaigns[15]);
        $manager->persist($metric16a);
        $campaigns[15]->calculateRevenueAndRoi();

        // Campaign 6 Metrics (Health & Fitness App)
        $metric17 = new Metric();
        $metric17->setName('App Subscriptions');
        $metric17->setValue('510.00');
        $metric17->setClicks(1020);
        $metric17->setConversions(102);
        $metric17->setRevenue('510.00');
        $metric17->setNotes('New premium app subscriptions');
        $metric17->setTimestamp(new \DateTimeImmutable('2025-01-20'));
        $metric17->setCampaign($campaigns[16]);
        $manager->persist($metric17);

        $metric18 = new Metric();
        $metric18->setName('Mobile App Downloads');
        $metric18->setValue('1875.00');
        $metric18->setClicks(7500);
        $metric18->setConversions(750);
        $metric18->setRevenue('1875.00');
        $metric18->setNotes('App store installations');
        $metric18->setTimestamp(new \DateTimeImmutable('2025-02-01'));
        $metric18->setCampaign($campaigns[16]);
        $manager->persist($metric18);

        $metric19 = new Metric();
        $metric19->setName('Fitness Consultations');
        $metric19->setValue('142.50');
        $metric19->setClicks(570);
        $metric19->setConversions(57);
        $metric19->setRevenue('142.50');
        $metric19->setNotes('Booked personal training sessions');
        $metric19->setTimestamp(new \DateTimeImmutable('2025-02-15'));
        $metric19->setCampaign($campaigns[16]);
        $manager->persist($metric19);

        $metric20 = new Metric();
        $metric20->setName('Nutrition Program Sales');
        $metric20->setValue('270.00');
        $metric20->setClicks(540);
        $metric20->setConversions(54);
        $metric20->setRevenue('270.00');
        $metric20->setNotes('Custom diet plan purchases');
        $metric20->setTimestamp(new \DateTimeImmutable('2025-03-01'));
        $metric20->setCampaign($campaigns[16]);
        $manager->persist($metric20);

        $metric20a = new Metric();
        $metric20a->setName('Fitness Platform Revenue');
        $metric20a->setValue('12750.00');
        $metric20a->setNotes('Revenue from subscriptions and services');
        $metric20a->setTimestamp(new \DateTimeImmutable('2025-03-10'));
        $metric20a->setCampaign($campaigns[16]);
        $manager->persist($metric20a);
        $campaigns[16]->calculateRevenueAndRoi();

        // Campaign 7 Metrics (E-commerce Platform Sale)
        $metric21 = new Metric();
        $metric21->setName('Platform Traffic Surge');
        $metric21->setValue('7500.00');
        $metric21->setClicks(7500);
        $metric21->setConversions(375);
        $metric21->setRevenue('7500.00');
        $metric21->setNotes('Website visitors during promotional period');
        $metric21->setTimestamp(new \DateTimeImmutable('2025-11-25'));
        $metric21->setCampaign($campaigns[17]);
        $manager->persist($metric21);

        $metric22 = new Metric();
        $metric22->setName('Sales Volume Metrics');
        $metric22->setValue('1875.00');
        $metric22->setClicks(3750);
        $metric22->setConversions(188);
        $metric22->setRevenue('1875.00');
        $metric22->setNotes('Total units sold during promotion');
        $metric22->setTimestamp(new \DateTimeImmutable('2025-11-29'));
        $metric22->setCampaign($campaigns[17]);
        $manager->persist($metric22);

        $metric23 = new Metric();
        $metric23->setName('E-commerce Revenue');
        $metric23->setValue('20000.00');
        $metric23->setNotes('Total revenue from platform sales');
        $metric23->setTimestamp(new \DateTimeImmutable('2025-11-30'));
        $metric23->setCampaign($campaigns[17]);
        $manager->persist($metric23);

        $metric24 = new Metric();
        $metric24->setName('Service Page Visits');
        $metric24->setValue('4800.00');
        $metric24->setClicks(4800);
        $metric24->setConversions(240);
        $metric24->setRevenue('4800.00');
        $metric24->setNotes('Digital service landing page views');
        $metric24->setTimestamp(new \DateTimeImmutable('2025-12-01'));
        $metric24->setCampaign($campaigns[18]);
        $manager->persist($metric24);

        $metric25 = new Metric();
        $metric25->setName('Service Subscriptions');
        $metric25->setValue('1335.00');
        $metric25->setClicks(2670);
        $metric25->setConversions(267);
        $metric25->setRevenue('1335.00');
        $metric25->setNotes('Digital service packages sold');
        $metric25->setTimestamp(new \DateTimeImmutable('2025-12-02'));
        $metric25->setCampaign($campaigns[18]);
        $manager->persist($metric25);

        $metric26 = new Metric();
        $metric26->setName('Digital Services Revenue');
        $metric26->setValue('15000.00');
        $metric26->setNotes('Revenue from digital products and subscriptions');
        $metric26->setTimestamp(new \DateTimeImmutable('2025-12-03'));
        $metric26->setCampaign($campaigns[18]);
        $manager->persist($metric26);

        $metric27 = new Metric();
        $metric27->setName('Beauty Product Views');
        $metric27->setValue('2700.00');
        $metric27->setClicks(2700);
        $metric27->setConversions(135);
        $metric27->setRevenue('2700.00');
        $metric27->setNotes('Premium beauty product page views');
        $metric27->setTimestamp(new \DateTimeImmutable('2025-02-05'));
        $metric27->setCampaign($campaigns[19]);
        $manager->persist($metric27);

        $metric28 = new Metric();
        $metric28->setName('Luxury Beauty Sales');
        $metric28->setValue('630.00');
        $metric28->setClicks(1260);
        $metric28->setConversions(126);
        $metric28->setRevenue('630.00');
        $metric28->setNotes('Units sold from premium beauty line');
        $metric28->setTimestamp(new \DateTimeImmutable('2025-02-14'));
        $metric28->setCampaign($campaigns[19]);
        $manager->persist($metric28);

        $metric29 = new Metric();
        $metric29->setName('Beauty Campaign Revenue');
        $metric29->setValue('5500.00');
        $metric29->setNotes('Revenue from premium beauty products');
        $metric29->setTimestamp(new \DateTimeImmutable('2025-02-15'));
        $metric29->setCampaign($campaigns[19]);
        $manager->persist($metric29);

        $metric30 = new Metric();
        $metric30->setName('Entertainment Signups');
        $metric30->setValue('975.00');
        $metric30->setClicks(1950);
        $metric30->setConversions(195);
        $metric30->setRevenue('975.00');
        $metric30->setNotes('Family entertainment package subscriptions');
        $metric30->setTimestamp(new \DateTimeImmutable('2025-03-25'));
        $metric30->setCampaign($campaigns[20]);
        $manager->persist($metric30);

        $metric31 = new Metric();
        $metric31->setName('Media Package Sales');
        $metric31->setValue('570.00');
        $metric31->setClicks(1140);
        $metric31->setConversions(114);
        $metric31->setRevenue('570.00');
        $metric31->setNotes('Entertainment bundles and subscriptions');
        $metric31->setTimestamp(new \DateTimeImmutable('2025-04-10'));
        $metric31->setCampaign($campaigns[20]);
        $manager->persist($metric31);

        $metric32 = new Metric();
        $metric32->setName('Entertainment Revenue');
        $metric32->setValue('3800.00');
        $metric32->setNotes('Revenue from family entertainment packages');
        $metric32->setTimestamp(new \DateTimeImmutable('2025-04-20'));
        $metric32->setCampaign($campaigns[20]);
        $manager->persist($metric32);

        $metric33 = new Metric();
        $metric33->setName('Course Catalog Views');
        $metric33->setValue('3150.00');
        $metric33->setClicks(3150);
        $metric33->setConversions(158);
        $metric33->setRevenue('3150.00');
        $metric33->setNotes('Professional development course listings viewed');
        $metric33->setTimestamp(new \DateTimeImmutable('2025-05-05'));
        $metric33->setCampaign($campaigns[21]);
        $manager->persist($metric33);

        $metric34 = new Metric();
        $metric34->setName('Course Enrollments');
        $metric34->setValue('435.00');
        $metric34->setClicks(870);
        $metric34->setConversions(87);
        $metric34->setRevenue('435.00');
        $metric34->setNotes('Students enrolled in professional courses');
        $metric34->setTimestamp(new \DateTimeImmutable('2025-05-10'));
        $metric34->setCampaign($campaigns[21]);
        $manager->persist($metric34);

        $metric35 = new Metric();
        $metric35->setName('Education Revenue');
        $metric35->setValue('13800.00');
        $metric35->setClicks(27600);
        $metric35->setConversions(2760);
        $metric35->setNotes('Revenue from professional development courses');
        $metric35->setTimestamp(new \DateTimeImmutable('2025-05-12'));
        $metric35->setCampaign($campaigns[21]);
        $manager->persist($metric35);

        $metric36 = new Metric();
        $metric36->setName('Tech Solution Searches');
        $metric36->setValue('2400.00');
        $metric36->setClicks(4800);
        $metric36->setConversions(480);
        $metric36->setNotes('Searches for technology solutions');
        $metric36->setTimestamp(new \DateTimeImmutable('2025-06-08'));
        $metric36->setCampaign($campaigns[22]);
        $manager->persist($metric36);

        $metric37 = new Metric();
        $metric37->setName('Solution Sales');
        $metric37->setValue('510.00');
        $metric37->setClicks(1020);
        $metric37->setConversions(102);
        $metric37->setNotes('Technology solution packages sold');
        $metric37->setTimestamp(new \DateTimeImmutable('2025-06-15'));
        $metric37->setCampaign($campaigns[22]);
        $manager->persist($metric37);

        $metric38 = new Metric();
        $metric38->setName('Tech Solutions Revenue');
        $metric38->setValue('11700.00');
        $metric38->setClicks(23400);
        $metric38->setConversions(2340);
        $metric38->setNotes('Revenue from technology solution sales');
        $metric38->setTimestamp(new \DateTimeImmutable('2025-06-16'));
        $metric38->setCampaign($campaigns[22]);
        $manager->persist($metric38);

        $metric39 = new Metric();
        $metric39->setName('Adventure Gear Views');
        $metric39->setValue('1800.00');
        $metric39->setClicks(3600);
        $metric39->setConversions(360);
        $metric39->setNotes('Outdoor equipment and gear page views');
        $metric39->setTimestamp(new \DateTimeImmutable('2025-06-25'));
        $metric39->setCampaign($campaigns[23]);
        $manager->persist($metric39);

        $metric40 = new Metric();
        $metric40->setName('Equipment Sales');
        $metric40->setValue('420.00');
        $metric40->setClicks(840);
        $metric40->setConversions(84);
        $metric40->setNotes('Outdoor adventure gear sold');
        $metric40->setTimestamp(new \DateTimeImmutable('2025-07-02'));
        $metric40->setCampaign($campaigns[23]);
        $manager->persist($metric40);

        $metric41 = new Metric();
        $metric41->setName('Adventure Gear Revenue');
        $metric41->setValue('9600.00');
        $metric41->setClicks(19200);
        $metric41->setConversions(1920);
        $metric41->setNotes('Revenue from outdoor adventure products');
        $metric41->setTimestamp(new \DateTimeImmutable('2025-07-04'));
        $metric41->setCampaign($campaigns[23]);
        $manager->persist($metric41);

        // Campaign 14 Metrics (Creative Arts Supplies)
        $metric42 = new Metric();
        $metric42->setName('Art Supply Searches');
        $metric42->setValue('1425.00');
        $metric42->setClicks(2850);
        $metric42->setConversions(285);
        $metric42->setNotes('Creative arts supplies and materials searches');
        $metric42->setTimestamp(new \DateTimeImmutable('2025-10-20'));
        $metric42->setCampaign($campaigns[24]);
        $manager->persist($metric42);

        $metric43 = new Metric();
        $metric43->setName('Art Material Orders');
        $metric43->setValue('630.00');
        $metric43->setClicks(1260);
        $metric43->setConversions(126);
        $metric43->setNotes('Art supplies and creative materials ordered');
        $metric43->setTimestamp(new \DateTimeImmutable('2025-10-28'));
        $metric43->setCampaign($campaigns[24]);
        $manager->persist($metric43);

        $metric44 = new Metric();
        $metric44->setName('Creative Arts Revenue');
        $metric44->setValue('2500.00');
        $metric44->setClicks(5000);
        $metric44->setConversions(500);
        $metric44->setNotes('Revenue from art supplies and materials');
        $metric44->setTimestamp(new \DateTimeImmutable('2025-10-31'));
        $metric44->setCampaign($campaigns[24]);
        $manager->persist($metric44);

        // Campaign 15 Metrics (Gourmet Food Delivery)
        $metric45 = new Metric();
        $metric45->setName('Recipe Content Views');
        $metric45->setValue('2700.00');
        $metric45->setClicks(5400);
        $metric45->setConversions(540);
        $metric45->setNotes('Gourmet recipe and meal planning content');
        $metric45->setTimestamp(new \DateTimeImmutable('2025-11-18'));
        $metric45->setCampaign($campaigns[25]);
        $manager->persist($metric45);

        $metric46 = new Metric();
        $metric46->setName('Meal Kit Orders');
        $metric46->setValue('525.00');
        $metric46->setClicks(1050);
        $metric46->setConversions(105);
        $metric46->setNotes('Gourmet meal delivery packages sold');
        $metric46->setTimestamp(new \DateTimeImmutable('2025-11-25'));
        $metric46->setCampaign($campaigns[25]);
        $manager->persist($metric46);

        $metric47 = new Metric();
        $metric47->setName('Food Delivery Revenue');
        $metric47->setValue('3500.00');
        $metric47->setClicks(7000);
        $metric47->setConversions(700);
        $metric47->setNotes('Revenue from gourmet food delivery services');
        $metric47->setTimestamp(new \DateTimeImmutable('2025-11-28'));
        $metric47->setCampaign($campaigns[25]);
        $manager->persist($metric47);

        $manager->flush();
    }
}
