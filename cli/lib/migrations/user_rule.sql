CREATE TABLE IF NOT EXISTS `user_rule` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `rule_entity_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_user_rule_rule_entity1_idx` (`rule_entity_id` ASC) VISIBLE,
  CONSTRAINT `fk_user_rule_rule_entity1`
    FOREIGN KEY (`rule_entity_id`)
    REFERENCES `rule_entity` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
