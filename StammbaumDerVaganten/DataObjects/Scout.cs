using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public class Timespan
    {
        public Date Start = new Date();
        public Date End = new Date();
        public bool WholeTime = false;
    }

    public class Membership : DataObject
    {
        public Timespan Timespan = new Timespan();
        public Group Group = new Group();
    }

    public class Activity : DataObject
    {
        public Timespan Timespan = new Timespan();
        public Role Role = new Role();
        public Group Group = new Group();
    }

    public class Scout : DataObject
    {
        String forename = new String();
        String lastname = new String();
        String scoutname = new String();

        public Date Birthdate = new Date();

        String contactInfo = new String();
        String comment = new String();

        public List<Membership> Memberships = new List<Membership>();
        public List<Activity> Activities = new List<Activity>();


        public string Forename
        {
            get { return forename.Value; }
            set { forename.Value = value; }
        }

        public string Lastname
        {
            get { return lastname.Value; }
            set { lastname.Value = value; }
        }

        public string Scoutname
        {
            get { return scoutname.Value; }
            set { scoutname.Value = value; }
        }

        public DateTime _Birthdate
        {
            get { return Birthdate.Value; }
            set { Birthdate.Value = value; }
        }

        public string ContactInfo
        {
            get { return contactInfo.Value; }
            set { contactInfo.Value = value; }
        }

        public string Comment
        {
            get { return comment.Value; }
            set { comment.Value = value; }
        }

        #region Retrieve Memberships and Activities
        public Membership GetFirstMembershipByGroup(Group group)
        {
            List<Membership> result = new List<Membership>();
            foreach (Membership ms in Memberships)
            {
                if (ms.Group == group)
                {
                    return ms;
                }
            }
            return null;
        }

        public Activity GetFirstActivityByGroup(Group group)
        {
            foreach (Activity a in Activities)
            {
                if (a.Group == group)
                {
                    return a;
                }
            }
            return null;
        }

        public List<Membership> GetMembershipsInGroup(Group group)
        {
            List<Membership> result = new List<Membership>();
            foreach (Membership ms in Memberships)
            {
                if (ms.Group == group)
                {
                    result.Add(ms);
                }
            }
            return result;
        }

        public List<Activity> GetActivitiesInGroup(Group group)
        {
            List<Activity> result = new List<Activity>();
            foreach (Activity a in Activities)
            {
                if (a.Group == group)
                {
                    result.Add(a);
                }
            }
            return result;
        }
        #endregion

    }
}
