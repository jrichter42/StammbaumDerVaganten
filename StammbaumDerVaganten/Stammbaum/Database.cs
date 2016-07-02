﻿using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public class Data
    {
        #region Serialization
        [DataMember]
        public ObservableCollection<Scout> _SL
        {
            get { return Scouts; }
            set { Scouts = value; }
        }
        [DataMember]
        public ObservableCollection<Group> _GL
        {
            get { return Groups; }
            set { Groups = value; }
        }
        [DataMember]
        public ObservableCollection<Role> _RL
        {
            get { return Roles; }
            set { Roles = value; }
        }
        #endregion

        public ObservableCollection<Scout> Scouts;
        public ObservableCollection<Group> Groups;
        public ObservableCollection<Role> Roles;

        public Data()
        {
            Scouts = new ObservableCollection<Scout>();
            Groups = new ObservableCollection<Group>();
            Roles = new ObservableCollection<Role>();
        }

        public Group GetGroupByID(int groupID)
        {
            if (groupID == Group.ID_INVALID)
            {
                return null;
            }

            foreach (Group g in Groups)
            {
                if (g.ID == groupID)
                {
                    return g;
                }
            }

            return null;
        }

        public Role GetRoleByID(int roleID)
        {
            if (roleID == Role.ID_INVALID)
            {
                return null;
            }

            foreach (Role r in Roles)
            {
                if (r.ID == roleID)
                {
                    return r;
                }
            }

            return null;
        }
    }

    public class Database
    {
        public Data Data;

        public Dictionary<int, Group> GroupIDMap;
        public Dictionary<int, Role> RoleIDMap;

        public Database()
        {
            Data = new Data();

            //TestData();
        }

        public bool Load()
        {
            string dataStr = "";
            if (FileManager.Instance.Read(ref dataStr))
            {
                if (Serializer<Data>.Deserialize(dataStr, ref Data))
                {
                    return true;
                }
            }
            return false;
        }
            
        public bool Save(bool humanReadable = true)
        {
            string dataStr = "";
            if (Serializer<Data>.Serialize(ref dataStr, Data, humanReadable))
            {
                if (FileManager.Instance.Write(dataStr))
                {
                    return true;
                }
            }
            return false;
        }

        private void TestData()
        {
            Group group = new Group(true);
            group.Type = GroupType_Type.Sippe;
            group.Name = "Phönix";
            Data.Groups.Add(group);

            Role role = new Role(true);
            role.Type = RoleType_Type.Sippenfuehrung;
            role.GroupType = GroupType_Type.Sippe;
            Data.Roles.Add(role);

            Scout scout = new Scout();
            scout.Forename = "Bob";
            scout.Lastname = "Baumeister";
            scout.Scoutname = "der";
            scout.Comment = "Jo, der schafft das!";
            scout.ContactInfo = "bob@baumeister.de";
            scout.Birthdate.Set(1985, 10, 14);

            Membership ms = new Membership();
            ms.Timespan.Start.Value.AddYears(2006);
            ms.Group = group;

            scout.Memberships.Add(ms);

            Activity a = new Activity();
            a.Timespan.Start.Value.AddYears(2006);
            a.Group = group;
            a.Role = role;

            scout.Activities.Add(a);
            Data.Scouts.Add(scout);
        }
    }
}
