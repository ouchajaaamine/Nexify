<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251021012339 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE affiliate (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_597AA5CFE7927C74 ON affiliate (email)');
        $this->addSql('COMMENT ON COLUMN affiliate.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN affiliate.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE campaign (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, budget NUMERIC(10, 2) DEFAULT \'0.00\' NOT NULL, start_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, end_date TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, status VARCHAR(255) DEFAULT \'draft\' NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN campaign.start_date IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN campaign.end_date IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN campaign.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN campaign.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE campaign_affiliate (campaign_id INT NOT NULL, affiliate_id INT NOT NULL, PRIMARY KEY(campaign_id, affiliate_id))');
        $this->addSql('CREATE INDEX IDX_99F2B9B4F639F774 ON campaign_affiliate (campaign_id)');
        $this->addSql('CREATE INDEX IDX_99F2B9B49F12C49A ON campaign_affiliate (affiliate_id)');
        $this->addSql('CREATE TABLE metric (id SERIAL NOT NULL, campaign_id INT NOT NULL, name VARCHAR(255) NOT NULL, value NUMERIC(10, 2) NOT NULL, clicks INT DEFAULT NULL, conversions INT DEFAULT NULL, revenue NUMERIC(10, 2) DEFAULT NULL, notes TEXT DEFAULT NULL, timestamp TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_87D62EE3F639F774 ON metric (campaign_id)');
        $this->addSql('COMMENT ON COLUMN metric.timestamp IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN metric.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN metric.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE campaign_affiliate ADD CONSTRAINT FK_99F2B9B4F639F774 FOREIGN KEY (campaign_id) REFERENCES campaign (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE campaign_affiliate ADD CONSTRAINT FK_99F2B9B49F12C49A FOREIGN KEY (affiliate_id) REFERENCES affiliate (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE metric ADD CONSTRAINT FK_87D62EE3F639F774 FOREIGN KEY (campaign_id) REFERENCES campaign (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE campaign_affiliate DROP CONSTRAINT FK_99F2B9B4F639F774');
        $this->addSql('ALTER TABLE campaign_affiliate DROP CONSTRAINT FK_99F2B9B49F12C49A');
        $this->addSql('ALTER TABLE metric DROP CONSTRAINT FK_87D62EE3F639F774');
        $this->addSql('DROP TABLE affiliate');
        $this->addSql('DROP TABLE campaign');
        $this->addSql('DROP TABLE campaign_affiliate');
        $this->addSql('DROP TABLE metric');
    }
}
